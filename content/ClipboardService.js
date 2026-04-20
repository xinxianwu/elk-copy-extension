const ClipboardService = {
  copy(text) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'COPY_TEXT', text },
        (response) => resolve(!chrome.runtime.lastError && !!response?.ok)
      );
    });
  },
};