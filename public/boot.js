// Apply the saved theme before first paint (the app bundle loads after this).
try {
  var mode = localStorage.getItem('dudo-mode') === 'play' ? 'dudo-v2-play' : 'dudo-v2';
  var s = JSON.parse(localStorage.getItem(mode) || '{}');
  if (s.theme) document.documentElement.dataset.theme = s.theme;
} catch (e) { /* private mode */ }
