type UiHookMap = {
  renderAll?: (options?: { save?: boolean }) => void;
  renderStats?: () => void;
  renderSlots?: () => void;
  renderEventLog?: () => void;
  renderLossArchives?: () => void;
  renderMarket?: () => void;
  renderTime?: () => void;
  refreshSelectOptions?: () => void;
  refreshPromoTypes?: () => void;
  updateGenrePreview?: () => void;
  openOverlay?: (id: string) => void;
  closeOverlay?: (id: string) => void;
  showEndScreen?: (title: string, lines: { title: string; detail?: string }[]) => void;
  openMainMenu?: () => void;
  closeMainMenu?: () => void;
  showToast?: (
    summary: string,
    detail?: string,
    options?: { tone?: string; actions?: { label: string; handler?: (toast: HTMLElement) => void }[] }
  ) => void;
};

const uiHooks: UiHookMap = {};

function setUiHooks(next: UiHookMap) {
  Object.assign(uiHooks, next);
}

export { setUiHooks, uiHooks };
