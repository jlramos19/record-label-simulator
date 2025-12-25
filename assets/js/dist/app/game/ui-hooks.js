const uiHooks = {};
function setUiHooks(next) {
    Object.assign(uiHooks, next);
}
export { setUiHooks, uiHooks };
