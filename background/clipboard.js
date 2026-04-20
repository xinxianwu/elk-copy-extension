export function setupClipboardRelay() {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type !== 'COPY_TEXT') return false;
    (async () => {
      try {
        const existing = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
        if (existing.length === 0) {
          await chrome.offscreen.createDocument({
            url: chrome.runtime.getURL('offscreen/offscreen.html'),
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
}