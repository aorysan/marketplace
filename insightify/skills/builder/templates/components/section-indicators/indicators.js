  // Active Navigation Highlight
  // ==========================================================================

  function initActiveNav() {
    const sections = document.querySelectorAll('.doc-section[id]');
    const navLinks = document.querySelectorAll('.section-indicator');

    if (sections.length === 0) return;

    const sectionsArr = Array.from(sections);
    
    function updateNav() {
      const scrollPos = window.scrollY + 120; // 120px offset for header
      let currentId = sectionsArr[0] ? sectionsArr[0].getAttribute('id') : null;
      
      for (const section of sectionsArr) {
        if (section.offsetTop <= scrollPos) {
          currentId = section.getAttribute('id');
        } else {
          break;
        }
      }

      if (currentId) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('data-section') === currentId);
        });
      }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // ==========================================================================