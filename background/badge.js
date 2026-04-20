const BADGE_TITLE_ACTIVE = 'ELK Field Copy — 已在此分頁啟用（偵測到 Kibana）';
const BADGE_TITLE_DEFAULT = 'ELK Field Copy';

function urlLooksLikeKibana(url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return false;
  try {
    const u = new URL(url);
    return /kibana/i.test(u.hostname) || /kibana/i.test(u.pathname) || /kibana/i.test(u.href);
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

async function syncActiveTabBadge() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id != null) syncTab(tab.id, tab.url);
  } catch {
    /* ignore */
  }
}

export function setupBadge() {
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

  chrome.runtime.onInstalled.addListener(syncActiveTabBadge);
  chrome.runtime.onStartup.addListener(syncActiveTabBadge);
}