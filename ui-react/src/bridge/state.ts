const STATE_EVENT = "rls:state-changed";

export function getRlsState() {
  if (typeof window === "undefined") return null;
  const anyWindow = window;
  return anyWindow.rlsState
    || anyWindow.__RLS_STATE__
    || anyWindow.rlsBridge?.state
    || null;
}

export function subscribe(listener) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STATE_EVENT, listener);
  return () => window.removeEventListener(STATE_EVENT, listener);
}

export function emitStateChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STATE_EVENT));
}
