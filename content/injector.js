(function () {
  if (window.__elkFieldCopyInjected) return;

  try {
    const { hostname, href, pathname } = window.location;
    if (!/kibana/i.test(hostname) && !/kibana/i.test(pathname) && !/kibana/i.test(href)) return;
  } catch {
    return;
  }

  window.__elkFieldCopyInjected = true;

  const page = new KibanaDocViewerPage();

  function addCopyButtons() {
    page.getValueCells().forEach((valueCell) => {
      const row = page.getRow(valueCell);
      if (!row) return;

      page.markRow(row);

      const host = page.getButtonHost(valueCell, row) || valueCell;

      page.cleanupButtons(row, host);
      if (page.hasButton(host)) return;

      const btn = new CopyButton(() => ClipboardService.copy(page.extractText(valueCell)));

      page.mountButton(host, btn.element);
    });
  }

  addCopyButtons();

  const observer = new MutationObserver(() => addCopyButtons());
  observer.observe(document.body, { childList: true, subtree: true });
})();