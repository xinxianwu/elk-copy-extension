class KibanaDocViewerPage {
  static ROW_CLASS = 'elk-doc-row';

  static #VALUE_SELECTORS = [
    '.kbnDocViewer__tableValueCell',
    'td[data-test-subj="tableDocViewRow-value"]',
    'td[data-test-subj^="tableDocViewRow-"][data-test-subj$="-value"]',
    '.kbnDocViewer__value',
    '[data-test-subj*="docViewerRowValue"]',
  ];

  getValueCells() {
    return KibanaDocViewerPage.#VALUE_SELECTORS
      .flatMap((s) => [...document.querySelectorAll(s)]);
  }

  getRow(valueCell) {
    return (
      valueCell.closest('.kbnDocViewer__tableRow') ||
      valueCell.closest('tr') ||
      valueCell.closest('[role="row"]') ||
      valueCell.closest('.euiDataGridRow')
    );
  }

  getButtonHost(valueCell, row) {
    const euiFieldName = row.querySelector('.kbnDocViewer__tableFieldNameCell');
    if (euiFieldName) return euiFieldName;

    const ts = valueCell.getAttribute('data-test-subj') || '';
    if (ts.endsWith('-value')) {
      const fieldTs = ts.replace(/-value$/, '-field');
      try {
        const byPair = row.querySelector(`[data-test-subj="${CSS.escape(fieldTs)}"]`);
        if (byPair) return byPair;
      } catch (_) { /* ignore */ }
    }
    return (
      row.querySelector('[data-test-subj*="docViewerRowField"]') ||
      row.querySelector('.kbnDocViewer__field') ||
      null
    );
  }

  markRow(row) {
    row.classList.add(KibanaDocViewerPage.ROW_CLASS);
  }

  hasButton(host) {
    return !!host.querySelector(`.${CopyButton.CLASS}`);
  }

  cleanupButtons(row, host) {
    row.querySelectorAll(`.${CopyButton.CLASS}`).forEach((b) => {
      if (!host.contains(b)) b.remove();
    });
    if (host.classList.contains('kbnDocViewer__tableFieldNameCell')) {
      host.querySelectorAll(`:scope > .${CopyButton.CLASS}`).forEach((b) => b.remove());
    }
  }

  mountButton(host, btn) {
    if (host.classList.contains('kbnDocViewer__tableFieldNameCell')) {
      this.#mountBesideFieldName(host, btn);
    } else {
      host.style.position = 'relative';
      host.appendChild(btn);
    }
  }

  #mountBesideFieldName(fieldNameCell, btn) {
    const nameText =
      fieldNameCell.querySelector('.kbnFieldName__name') ||
      fieldNameCell.querySelector('.kbnFieldName span[title]') ||
      fieldNameCell.querySelector('.kbnFieldName .euiText');
    if (nameText) { nameText.insertAdjacentElement('afterend', btn); return; }

    const fieldNameBlock = fieldNameCell.querySelector('.kbnFieldName');
    if (fieldNameBlock) { fieldNameBlock.appendChild(btn); return; }

    // 常見結構：fieldIcon(euiFlexItem) + 包住欄位名的 euiFlexGroup — 按鈕必須進後者
    const nameCluster =
      fieldNameCell.querySelector(':scope > .euiFlexItem + .euiFlexGroup') ||
      fieldNameCell.querySelector(':scope > .kbnDocViewer__fieldIcon + .euiFlexGroup') ||
      fieldNameCell.querySelector(':scope > .euiFlexGroup.euiFlexGroup--wrap') ||
      fieldNameCell.querySelector(':scope > .euiFlexGroup');
    if (nameCluster) { nameCluster.appendChild(btn); return; }

    fieldNameCell.style.position = 'relative';
    fieldNameCell.appendChild(btn);
  }

  extractText(valueCell) {
    const clone = valueCell.cloneNode(true);
    clone.querySelectorAll(`.${CopyButton.CLASS}`).forEach((b) => b.remove());
    return clone.innerText.replace(/\u2398/g, '').trim();
  }
}