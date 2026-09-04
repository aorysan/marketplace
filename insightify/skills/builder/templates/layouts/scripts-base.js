/**
 * Insightify v6 — Minimal JavaScript for Artifact-Style Documentation
 * Only handles: theme toggle, Mermaid initialization, smooth scroll, copy code
 */

(function() {
  'use strict';

  {{> site-header-js}}

  {{> section-indicators-js}}

  // ==========================================================================
  // Mermaid Initialization
  // ==========================================================================

  function initMermaid() {
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        securityLevel: 'loose',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        fontSize: 14,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        },
        sequence: {
          useMaxWidth: true
        }
      });

      // Re-render when theme changes
      const observer = new MutationObserver(() => {
        mermaid.init(undefined, document.querySelectorAll('.mermaid'));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTR] });
    }
  }

  // ==========================================================================
  // Smooth Scroll
  // ==========================================================================

  function scrollToTarget(target) {
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        scrollToTarget(target);
        history.pushState(null, '', href);
      }
    });
  }

  // ==========================================================================
  // Copy Code Button (Progressive Enhancement)
  // ==========================================================================

  function initCopyCode() {
    if (!navigator.clipboard) return;

    const codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.setAttribute('aria-label', 'Copy code');
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
      
      block.appendChild(button);

      button.addEventListener('click', async () => {
        const code = block.querySelector('code');
        if (code) {
          try {
            await navigator.clipboard.writeText(code.textContent);
            button.classList.add('copied');
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `;
            setTimeout(() => {
              button.classList.remove('copied');
              button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              `;
            }, 2000);
          } catch {
            button.classList.add('error');
            setTimeout(() => button.classList.remove('error'), 2000);
          }
        }
      });
    });
  }

  // ==========================================================================
  // Initialize All
  // ==========================================================================

  function init() {
    initTheme();
    initMermaid();
    initSmoothScroll();
    initCopyCode();
    initActiveNav();

    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // Expose for debugging
    window.Insightify = {
      theme: {
        get: getStoredTheme,
        getStored: getStoredTheme,
        getEffective: getEffectiveTheme,
        getSystem: getSystemTheme,
        set: setTheme,
        toggle: toggleTheme
      }
    };
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();