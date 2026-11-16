// Keeps the visitor's theme choice across pages of this website, for this browser tab only (sessionStorage, cleared when the tab
// closes). Nothing is written until the visitor presses the theme toggle. Loaded in <head> so the theme is applied before first paint.
(function () {
  var KEY = 'hd-theme';
  try {
    var saved = sessionStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);
  } catch {
    /* storage unavailable: the system theme applies */
  }
  document.addEventListener('hexa-theme-change', function (e) {
    var theme = e.detail && e.detail.theme;
    if (theme !== 'light' && theme !== 'dark') return;
    try {
      sessionStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  });
})();
