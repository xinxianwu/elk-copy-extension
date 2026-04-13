const BUTTON_CLASS = 'elk-copy-btn';
const ROW_CLASS = 'elk-doc-row';

/** Kibana Doc viewer / DataGrid：包住同一筆 field–value 的列容器 */
function findDocRow(valueEl) {
  return (
    valueEl.closest('.kbnDocViewer__tableRow') ||
    valueEl.closest('tr') ||
    valueEl.closest('[role="row"]') ||
    valueEl.closest('.euiDataGridRow')
  );
}

/**
 * 把按鈕放在「欄位名稱」那一格。
 * EuiTable 版 unified doc viewer：第二欄為 .kbnDocViewer__tableFieldNameCell（不一定有 …-field 的 test subj）
 */
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

/**
 * 插在「欄位名字」旁，不要 append 在整格 .kbnDocViewer__tableFieldNameCell 底層
 * （會變成與「圖示區」「名稱區」並列的第三個 flex 子項，被撐到欄位最右）
 */
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
    // EuiTable doc viewer：第三欄 value（與 .kbnDocViewer__tableFieldNameCell 同列）
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

      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const value = getCopyText(valueCell);
        try {
          await navigator.clipboard.writeText(value);
          btn.textContent = '✓';
          setTimeout(() => {
            btn.textContent = '⎘';
          }, 1500);
        } catch {
          btn.textContent = '✗';
          setTimeout(() => {
            btn.textContent = '⎘';
          }, 1500);
        }
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
