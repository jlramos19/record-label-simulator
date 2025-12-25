import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import puppeteer from "puppeteer";

const PORT = 5173;
const URL = `http://localhost:${PORT}/`;
const LOG_KEEP_COUNT = 3;
const MAX_LOG_LINE = 240;
const MAX_ARG_CHARS = 160;
const MAX_ARGS = 3;
const HTTP_LOG_RE = /"(\w+)\s+([^\s]+)\s+HTTP\/[0-9.]+"\s+(\d{3})/;
const ANSI_REGEX = /\u001b\[[0-9;]*[A-Za-z]/g;
const ANSI_OSC_REGEX = /\u001b\][^\u0007]*\u0007/g;
const CMD_EXE = process.env.comspec || "cmd.exe";

function spawnNpm(script, options) {
  if (process.platform === "win32") {
    return spawn(CMD_EXE, ["/d", "/s", "/c", `npm run ${script}`], options);
  }
  return spawn("npm", ["run", script], options);
}

const lineBuffers = new Map();

function stripAnsi(value) {
  return value.replace(ANSI_OSC_REGEX, "").replace(ANSI_REGEX, "");
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 3))}...`;
}

function compactLine(value) {
  const cleaned = stripAnsi(String(value)).replace(/\r/g, "").trim();
  if (!cleaned) return null;
  return truncate(cleaned, MAX_LOG_LINE);
}

function shouldSkipServerLine(line) {
  const match = HTTP_LOG_RE.exec(line);
  if (!match) return false;
  const url = match[2];
  const status = Number(match[3]);
  if (status >= 400) return false;
  if (url === "/favicon.ico") return true;
  if (url.startsWith("/assets/")) return true;
  return false;
}

function writeChunk(write, type, chunk, { skip } = {}) {
  const prev = lineBuffers.get(type) || "";
  const text = prev + String(chunk);
  const lines = text.split(/\r?\n/);
  lineBuffers.set(type, lines.pop() || "");
  for (const line of lines) {
    const compact = compactLine(line);
    if (!compact) continue;
    if (skip && skip(compact)) continue;
    write({ type, t: Date.now(), msg: compact });
  }
}

function flushLineBuffers(write) {
  for (const [type, line] of lineBuffers.entries()) {
    const compact = compactLine(line);
    if (compact) {
      write({ type, t: Date.now(), msg: compact });
    }
  }
  lineBuffers.clear();
}

function summarizeArgs(args) {
  return args.slice(0, MAX_ARGS).map((arg) => {
    if (arg === null || arg === undefined) return String(arg);
    if (typeof arg === "string") return truncate(arg, MAX_ARG_CHARS);
    if (typeof arg === "number" || typeof arg === "boolean" || typeof arg === "bigint") return String(arg);
    try {
      return truncate(JSON.stringify(arg), MAX_ARG_CHARS);
    } catch {
      return `[${typeof arg}]`;
    }
  });
}

function listSessionLogs(logsDir) {
  return fs.readdirSync(logsDir)
    .filter((name) => name.startsWith("session-") && name.endsWith(".ndjson"))
    .sort()
    .map((name) => path.join(logsDir, name));
}

function pruneOldLogs(logsDir, keep, currentPath) {
  const logs = listSessionLogs(logsDir);
  const keepSet = new Set();
  if (currentPath) keepSet.add(path.resolve(currentPath));
  const remaining = Math.max(0, keep - keepSet.size);
  logs.slice(-remaining).forEach((entry) => keepSet.add(path.resolve(entry)));
  logs.forEach((entry) => {
    if (keepSet.has(path.resolve(entry))) return;
    try {
      fs.unlinkSync(entry);
    } catch {
      // ignore
    }
  });
}

function resolveEdgeExecutable() {
  const envPath = process.env.EDGE_PATH || process.env.MSEDGE_PATH;
  if (envPath) return envPath;
  if (process.platform === "win32") {
    const programFiles = process.env.ProgramFiles || "C:\\Program Files";
    const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
    const localAppData = process.env.LOCALAPPDATA || "";
    return [
      path.join(programFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
      path.join(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
      localAppData ? path.join(localAppData, "Microsoft", "Edge", "Application", "msedge.exe") : ""
    ].find((p) => p && fs.existsSync(p));
  }
  if (process.platform === "darwin") {
    const macPath = "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge";
    return fs.existsSync(macPath) ? macPath : undefined;
  }
  const linuxCandidates = [
    "/usr/bin/microsoft-edge",
    "/usr/bin/microsoft-edge-stable",
    "/snap/bin/microsoft-edge"
  ];
  return linuxCandidates.find((p) => fs.existsSync(p));
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}__${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function waitForServer(url, timeoutMs = 20_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server not reachable at ${url} within ${timeoutMs}ms`));
        } else {
          setTimeout(tryOnce, 250);
        }
      });
    };
    tryOnce();
  });
}

async function maximizeWindow(page) {
  try {
    const client = await page.target().createCDPSession();
    const { windowId } = await client.send("Browser.getWindowForTarget");
    await client.send("Browser.setWindowBounds", {
      windowId,
      bounds: { windowState: "maximized" }
    });
  } catch {
    // ignore
  }
}

function safeKill(child) {
  if (!child || child.killed) return;
  try {
    child.kill("SIGINT");
  } catch {
    // ignore
  }
}

const run = async () => {
  const logsDir = path.resolve("usage-logs");
  const profileDir = process.env.RLS_BROWSER_PROFILE_DIR
    ? path.resolve(process.env.RLS_BROWSER_PROFILE_DIR)
    : path.join(logsDir, "browser-profile");
  fs.mkdirSync(logsDir, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });

  const logPath = path.join(logsDir, `session-${timestamp()}.ndjson`);
  const logStream = fs.createWriteStream(logPath, { flags: "a" });
  const write = (obj) => logStream.write(`${JSON.stringify(obj)}\n`);
  pruneOldLogs(logsDir, LOG_KEEP_COUNT, logPath);

  let tsc;
  let server;
  let browser;

  try {
    tsc = spawnNpm("watch", { stdio: ["ignore", "pipe", "pipe"] });
    tsc.stdout.on("data", (d) => writeChunk(write, "tsc.stdout", d));
    tsc.stderr.on("data", (d) => writeChunk(write, "tsc.stderr", d));

    server = spawnNpm("start", { stdio: ["ignore", "pipe", "pipe"] });
    server.stdout.on("data", (d) => writeChunk(write, "server.stdout", d, { skip: shouldSkipServerLine }));
    server.stderr.on("data", (d) => writeChunk(write, "server.stderr", d, { skip: shouldSkipServerLine }));

    await waitForServer(URL);

    const edgePath = resolveEdgeExecutable();
    if (!edgePath || !fs.existsSync(edgePath)) {
      throw new Error("Microsoft Edge executable not found. Set EDGE_PATH to msedge.exe or install Edge.");
    }

    browser = await puppeteer.launch({
      headless: false,
      executablePath: edgePath,
      userDataDir: profileDir,
      defaultViewport: null,
      args: [
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--no-first-run",
        "--no-default-browser-check",
        "--start-maximized"
      ]
    });

    const page = await browser.newPage();
    const pages = await browser.pages();
    for (const extra of pages) {
      if (extra === page) continue;
      try {
        await extra.close();
      } catch {
        // ignore
      }
    }

    await maximizeWindow(page);

    await page.setBypassServiceWorker(true);
    await page.setCacheEnabled(false);

    page.on("console", async (msg) => {
      const handles = msg.args();
      const limited = handles.slice(0, MAX_ARGS);
      const args = await Promise.all(
        limited.map(async (a) => {
          try {
            return await a.jsonValue();
          } catch {
            return String(a);
          }
        })
      );
      const summarized = summarizeArgs(args);
      const extraCount = Math.max(0, handles.length - MAX_ARGS);
      const payload = {
        type: "browser.console",
        t: Date.now(),
        level: msg.type(),
        text: truncate(msg.text(), MAX_LOG_LINE),
        args: summarized
      };
      if (extraCount > 0) payload.args_more = extraCount;
      write(payload);
    });

    page.on("pageerror", (err) => {
      write({ type: "browser.pageerror", t: Date.now(), msg: String(err?.stack || err) });
    });

    page.on("requestfailed", (req) => {
      write({
        type: "browser.requestfailed",
        t: Date.now(),
        url: req.url(),
        method: req.method(),
        failure: req.failure()
      });
    });

    await page.goto(URL, { waitUntil: "domcontentloaded" });

    console.log("RLS dev session started.");
    console.log(`- URL: ${URL}`);
    console.log(`- Log file: ${logPath}`);
    console.log(`- Profile dir: ${profileDir}`);
    console.log("Interact with the opened browser. Close it to stop.");

    await new Promise((resolve) => browser.on("disconnected", resolve));
    flushLineBuffers(write);
    write({ type: "session.end", t: Date.now() });
  } catch (err) {
    flushLineBuffers(write);
    write({ type: "session.error", t: Date.now(), msg: String(err?.stack || err) });
    throw err;
  } finally {
    if (browser?.isConnected?.()) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
    flushLineBuffers(write);
    logStream.end();
    safeKill(server);
    safeKill(tsc);
  }
};

process.on("SIGINT", () => {
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
