// Runs in chrome-extension:// (secure) context.
// navigator.clipboard requires focus which offscreen docs never have,
// so use execCommand('copy') which works without focus in extension contexts.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'DO_COPY') return false;
  const ta = document.createElement('textarea');
  ta.value = msg.text;
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  sendResponse({ ok, error: ok ? undefined : 'execCommand returned false' });
  return false;
});