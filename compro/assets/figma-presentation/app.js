document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide-item');
  const dotButtons = document.querySelectorAll('.nav-dot-btn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const counterCurrent = document.getElementById('counterCurrent');
  const counterTotal = document.getElementById('counterTotal');
  const progressBar = document.getElementById('progressBar');

  const total = slides.length;
  let currentIndex = 0;

  if (counterTotal) {
    counterTotal.textContent = String(total).padStart(2, '0');
  }

  function goToSlide(index) {
    currentIndex = Math.min(total - 1, Math.max(0, index));

    // Update slides
    slides.forEach((slide, i) => {
      if (i === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update dot buttons
    dotButtons.forEach((btn, i) => {
      if (i === currentIndex) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
      }
    });

    // Update counter
    if (counterCurrent) {
      counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
    }

    // Update progress bar
    if (progressBar) {
      const percentage = ((currentIndex + 1) / total) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // Update arrow buttons disabled state
    if (prevBtn) {
      prevBtn.disabled = currentIndex === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = currentIndex === total - 1;
    }
  }

  // Event Listeners for controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }

  dotButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-slide-index'), 10);
      if (!isNaN(idx)) {
        goToSlide(idx);
      }
    });
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    // Prevent interfering with input elements if any
    if (['input', 'textarea', 'select'].includes(document.activeElement?.tagName?.toLowerCase())) {
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goToSlide(currentIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goToSlide(currentIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(total - 1);
    }
  });

  // Initial call
  goToSlide(0);
});
