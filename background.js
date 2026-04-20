const BADGE_TITLE_ACTIVE = 'ELK Field Copy — 已在此分頁啟用（偵測到 Kibana）';
const BADGE_TITLE_DEFAULT = 'ELK Field Copy';

function urlLooksLikeKibana(url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return false;
  }
  try {
    const u = new URL(url);
    return (
      /kibana/i.test(u.hostname) ||
      /kibana/i.test(u.pathname) ||
      /kibana/i.test(u.href)
    );
  } catch {
    return false;
  }
}

function setBadgeForTab(tabId, isKibana) {
  if (isKibana) {
    chrome.action.setBadgeText({ tabId, text: '●' });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#238636' });
    chrome.action.setTitle({ tabId, title: BADGE_TITLE_ACTIVE });
  } else {
    chrome.action.setBadgeText({ tabId, text: '' });
    chrome.action.setTitle({ tabId, title: BADGE_TITLE_DEFAULT });
  }
}

function syncTab(tabId, url) {
  setBadgeForTab(tabId, urlLooksLikeKibana(url));
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo.url ?? tab.url;
  if (changeInfo.status === 'complete' || changeInfo.url) {
    syncTab(tabId, url || tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    syncTab(activeInfo.tabId, tab.url);
  } catch {
    /* ignore */
  }
});

async function syncActiveTabBadge() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id != null) syncTab(tab.id, tab.url);
  } catch {
    /* ignore */
  }
}

chrome.runtime.onInstalled.addListener(syncActiveTabBadge);
chrome.runtime.onStartup.addListener(syncActiveTabBadge);

// Clipboard relay: content script → background → offscreen document
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'COPY_TEXT') return false;
  (async () => {
    try {
      const existing = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
      if (existing.length === 0) {
        await chrome.offscreen.createDocument({
          url: chrome.runtime.getURL('offscreen.html'),
          reasons: ['CLIPBOARD'],
          justification: 'Write text to clipboard from HTTP Kibana pages',
        });
      }
      const result = await chrome.runtime.sendMessage({ type: 'DO_COPY', text: msg.text });
      sendResponse(result ?? { ok: false, error: 'no response from offscreen' });
    } catch (err) {
      sendResponse({ ok: false, error: err.message });
    }
  })();
  return true;
});
