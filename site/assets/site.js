// Site-only behaviour. No storage, no network, no third parties.
// 1. Copy-to-clipboard for swatches (data-copy). 2. Open native <dialog> demos (data-open-dialog).
document.addEventListener('click', (e) => {
  const target = e.target instanceof Element ? e.target : null;
  const copy = target?.closest('[data-copy]');
  if (copy instanceof HTMLElement && navigator.clipboard) {
    const value = copy.dataset.copy ?? '';
    const hint = copy.querySelector('.site-swatch__hint');
    void navigator.clipboard.writeText(value).then(() => {
      if (hint) {
        hint.textContent = 'Copied';
        setTimeout(() => {
          hint.textContent = 'Copy';
        }, 1200);
      }
    });
  }
  const opener = target?.closest('[data-open-dialog]');
  if (opener instanceof HTMLElement) {
    const dialog = document.getElementById(opener.dataset.openDialog ?? '');
    if (dialog instanceof HTMLDialogElement) dialog.showModal();
  }
});
