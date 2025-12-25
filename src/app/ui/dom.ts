const $ = (id: string): any => document.getElementById(id);

function openOverlay(id: string) {
  const el = $(id);
  if (!el) return;
  el.style.display = "flex";
  el.setAttribute("aria-hidden", "false");
}

function closeOverlay(id: string) {
  const el = $(id);
  if (!el) return;
  el.style.display = "none";
  el.setAttribute("aria-hidden", "true");
}

function showEndScreen(title: string, lines: { title: string; detail?: string }[]) {
  const titleEl = $("endTitle");
  const listEl = $("endMessage");
  if (!titleEl || !listEl) return;
  titleEl.textContent = title;
  listEl.innerHTML = lines.map((line) => `
    <div class="list-item">
      <div class="item-title">${line.title}</div>
      ${line.detail ? `<div class="muted">${line.detail}</div>` : ""}
    </div>
  `).join("");
  openOverlay("endModal");
}

function getSlotElement(targetId: string) {
  return document.querySelector(`[data-slot-target="${targetId}"]`);
}

function shakeElement(el: Element | null) {
  if (!el) return;
  el.classList.remove("shake");
  void (el as HTMLElement).offsetWidth;
  el.classList.add("shake");
  window.setTimeout(() => {
    el.classList.remove("shake");
  }, 320);
}

function shakeSlot(targetId: string) {
  shakeElement(getSlotElement(targetId));
}

function shakeField(fieldId: string) {
  const el = $(fieldId);
  if (!el) return;
  const field = el.closest(".field") || el;
  shakeElement(field);
}

function describeSlot(targetId: string) {
  const slot = getSlotElement(targetId);
  if (!slot) return targetId || "-";
  const label = slot.querySelector(".slot-label");
  return label ? (label as HTMLElement).textContent : targetId;
}

export {
  $,
  closeOverlay,
  describeSlot,
  getSlotElement,
  openOverlay,
  shakeElement,
  shakeField,
  shakeSlot,
  showEndScreen
};
