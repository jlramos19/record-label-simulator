type RenderAllFn = (options?: { save?: boolean }) => void;
type RenderFn = () => void;

type RenderSchedulerConfig = {
  renderAll?: RenderAllFn;
  renderTime?: RenderFn;
  renderStats?: RenderFn;
  renderSlots?: RenderFn;
  renderMarket?: RenderFn;
  renderEventLog?: RenderFn;
  renderLossArchives?: RenderFn;
};

type RenderQueue = {
  all: boolean;
  time: boolean;
  stats: boolean;
  slots: boolean;
  market: boolean;
  eventLog: boolean;
  lossArchives: boolean;
};

export function createRenderScheduler(config: RenderSchedulerConfig) {
  const queue: RenderQueue = {
    all: false,
    time: false,
    stats: false,
    slots: false,
    market: false,
    eventLog: false,
    lossArchives: false,
  };
  let pendingSave = false;
  let rafId = 0;

  const resetQueue = () => {
    queue.all = false;
    queue.time = false;
    queue.stats = false;
    queue.slots = false;
    queue.market = false;
    queue.eventLog = false;
    queue.lossArchives = false;
  };

  const flush = () => {
    rafId = 0;
    const hasRenderAll = typeof config.renderAll === "function";
    if (queue.all && hasRenderAll) {
      const save = pendingSave;
      pendingSave = false;
      resetQueue();
      config.renderAll?.({ save });
      return;
    }
    const snapshot = { ...queue };
    const calls = [
      { key: "time", fn: config.renderTime },
      { key: "stats", fn: config.renderStats },
      { key: "slots", fn: config.renderSlots },
      { key: "market", fn: config.renderMarket },
      { key: "eventLog", fn: config.renderEventLog },
      { key: "lossArchives", fn: config.renderLossArchives },
    ];
    resetQueue();
    pendingSave = false;
    calls.forEach(({ key, fn }) => {
      if (!snapshot[key] && !snapshot.all) return;
      if (typeof fn === "function") fn();
    });
  };

  const requestFlush = () => {
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      flush();
      return;
    }
    if (rafId) return;
    rafId = window.requestAnimationFrame(flush);
  };

  const schedule = (key: keyof RenderQueue) => {
    queue[key] = true;
    requestFlush();
  };

  return {
    renderAll: (options?: { save?: boolean }) => {
      queue.all = true;
      pendingSave = pendingSave || options?.save !== false;
      requestFlush();
    },
    renderTime: () => schedule("time"),
    renderStats: () => schedule("stats"),
    renderSlots: () => schedule("slots"),
    renderMarket: () => schedule("market"),
    renderEventLog: () => schedule("eventLog"),
    renderLossArchives: () => schedule("lossArchives"),
  };
}
