const applyTheme = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
};

applyTheme();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
