// Apply the saved theme before first paint (the app bundle loads after this).
try {
  var s = JSON.parse(localStorage.getItem('dudo-v2') || '{}');
  if (s.theme) document.documentElement.dataset.theme = s.theme;
} catch (e) { /* private mode */ }
