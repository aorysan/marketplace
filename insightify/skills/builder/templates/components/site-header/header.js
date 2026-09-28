  // Theme Management
  // ==========================================================================

  const THEME_KEY = 'insightify-theme';
  const THEME_ATTR = 'data-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }

  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function getEffectiveTheme(theme) {
    const target = theme || getStoredTheme() || 'system';
    if (target === 'system') {
      return getSystemTheme();
    }
    return target;
  }

  function applyThemeToDom(effectiveTheme) {
    document.documentElement.setAttribute(THEME_ATTR, effectiveTheme);
  }

  function setTheme(theme) {
    const intended = theme || 'system';
    setStoredTheme(intended);
    const effective = getEffectiveTheme(intended);
    applyThemeToDom(effective);
  }

  function applyTheme(theme) {
    setTheme(theme);
  }

  function initTheme() {
    const stored = getStoredTheme() || 'system';
    const effective = getEffectiveTheme(stored);
    applyThemeToDom(effective);

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        const currentStored = getStoredTheme();
        if (currentStored === 'system' || currentStored === null) {
          applyThemeToDom(getSystemTheme());
        }
      });
    }
  }

  function toggleTheme() {
    const current = getStoredTheme() || 'system';
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(current);
    const nextIndex = (currentIndex === -1) ? 0 : (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme);
    return nextTheme;
  }

  // ==========================================================================