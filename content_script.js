(function () {
  if (window.__elkFieldCopyInjected) return;

  function urlLooksLikeKibana() {
    try {
      const { hostname, href, pathname } = window.location;
      return /kibana/i.test(hostname) || /kibana/i.test(pathname) || /kibana/i.test(href);
    } catch {
      return false;
    }
  }

  if (!urlLooksLikeKibana()) return;
  window.__elkFieldCopyInjected = true;

const BUTTON_CLASS = 'elk-copy-btn';
const ROW_CLASS = 'elk-doc-row';

function findDocRow(valueEl) {
  return (
    valueEl.closest('.kbnDocViewer__tableRow') ||
    valueEl.closest('tr') ||
    valueEl.closest('[role="row"]') ||
    valueEl.closest('.euiDataGridRow')
  );
}

function findFieldButtonHost(valueEl, row) {
  const euiFieldName = row.querySelector('.kbnDocViewer__tableFieldNameCell');
  if (euiFieldName) return euiFieldName;

  const ts = valueEl.getAttribute('data-test-subj') || '';
  if (ts.endsWith('-value')) {
    const fieldTs = ts.replace(/-value$/, '-field');
    try {
      const byPair = row.querySelector(`[data-test-subj="${CSS.escape(fieldTs)}"]`);
      if (byPair) return byPair;
    } catch (_) {
      /* ignore */
    }
  }
  const gridField = row.querySelector('[data-test-subj*="docViewerRowField"]');
  if (gridField) return gridField;
  const legacyField = row.querySelector('.kbnDocViewer__field');
  if (legacyField) return legacyField;
  return null;
}

function mountCopyButtonBesideFieldName(fieldNameCell, btn) {
  const nameText =
    fieldNameCell.querySelector('.kbnFieldName__name') ||
    fieldNameCell.querySelector('.kbnFieldName span[title]') ||
    fieldNameCell.querySelector('.kbnFieldName .euiText');
  if (nameText) {
    nameText.insertAdjacentElement('afterend', btn);
    return;
  }
  const fieldNameBlock = fieldNameCell.querySelector('.kbnFieldName');
  if (fieldNameBlock) {
    fieldNameBlock.appendChild(btn);
    return;
  }
  // 常見結構：fieldIcon(euiFlexItem) + 包住欄位名的 euiFlexGroup — 按鈕必須進後者
  const nameCluster =
    fieldNameCell.querySelector(':scope > .euiFlexItem + .euiFlexGroup') ||
    fieldNameCell.querySelector(':scope > .kbnDocViewer__fieldIcon + .euiFlexGroup') ||
    fieldNameCell.querySelector(':scope > .euiFlexGroup.euiFlexGroup--wrap') ||
    fieldNameCell.querySelector(':scope > .euiFlexGroup');
  if (nameCluster) {
    nameCluster.appendChild(btn);
    return;
  }
  fieldNameCell.style.position = 'relative';
  fieldNameCell.appendChild(btn);
}

function getCopyText(valueEl) {
  const clone = valueEl.cloneNode(true);
  clone.querySelectorAll(`.${BUTTON_CLASS}`).forEach((b) => b.remove());
  return clone.innerText.replace(/\u2398/g, '').trim();
}

function addCopyButtons() {
  const selectors = [
    '.kbnDocViewer__tableValueCell',
    'td[data-test-subj="tableDocViewRow-value"]',
    'td[data-test-subj^="tableDocViewRow-"][data-test-subj$="-value"]',
    '.kbnDocViewer__value',
    '[data-test-subj*="docViewerRowValue"]',
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((valueCell) => {
      const row = findDocRow(valueCell);
      if (!row) return;

      row.classList.add(ROW_CLASS);

      const host = findFieldButtonHost(valueCell, row) || valueCell;

      row.querySelectorAll(`.${BUTTON_CLASS}`).forEach((b) => {
        if (!host.contains(b)) b.remove();
      });

      if (host.classList.contains('kbnDocViewer__tableFieldNameCell')) {
        host.querySelectorAll(`:scope > .${BUTTON_CLASS}`).forEach((b) => b.remove());
      }

      if (host.querySelector(`.${BUTTON_CLASS}`)) return;

      const btn = document.createElement('button');
      btn.className = BUTTON_CLASS;
      btn.title = '複製';
      btn.textContent = '⎘';
      btn.type = 'button';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = getCopyText(valueCell);
        // Route through background → offscreen document so clipboard write always
        // runs in a secure extension context, even when the page is HTTP.
        chrome.runtime.sendMessage({ type: 'COPY_TEXT', text: value }, (response) => {
          if (chrome.runtime.lastError || !response?.ok) {
            btn.textContent = '✗';
          } else {
            btn.textContent = '✓';
          }
          setTimeout(() => { btn.textContent = '⎘'; }, 1500);
        });
      });

      if (host.classList.contains('kbnDocViewer__tableFieldNameCell')) {
        mountCopyButtonBesideFieldName(host, btn);
      } else {
        host.style.position = 'relative';
        host.appendChild(btn);
      }
    });
  });
}

addCopyButtons();

const observer = new MutationObserver(() => addCopyButtons());
observer.observe(document.body, { childList: true, subtree: true });

})();
