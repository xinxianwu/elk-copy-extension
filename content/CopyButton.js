class CopyButton {
  static CLASS = 'elk-copy-btn';

  #el;

  // onCopy: () => Promise<boolean>
  constructor(onCopy) {
    this.#el = document.createElement('button');
    this.#el.className = CopyButton.CLASS;
    this.#el.title = '複製';
    this.#el.textContent = '⎘';
    this.#el.type = 'button';

    this.#el.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await onCopy();
      this.#el.textContent = ok ? '✓' : '✗';
      setTimeout(() => { this.#el.textContent = '⎘'; }, 1500);
    });
  }

  get element() {
    return this.#el;
  }
}