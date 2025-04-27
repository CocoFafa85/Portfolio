  window.addEventListener("DOMContentLoaded", () => {
    const skip = sessionStorage.getItem('skipAnimation');

    if (skip) {
      // === Skip les animations ===
      document.querySelectorAll('.fly-in-text li').forEach(el => {
        el.classList.remove('hidden');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });

      document.querySelectorAll('.orbiter, h2').forEach(el => {
        el.style.opacity = '1';
        el.style.animation = 'none';
      });

      // Nettoyer après
      sessionStorage.removeItem('skipAnimation');
    } else {
      // === Déclencher les animations normalement ===
      document.querySelectorAll('.fly-in-text li').forEach((el, index) => {
        setTimeout(() => el.classList.remove('hidden'), 100 * index);
      });
    }
  });



