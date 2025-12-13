 const lines = document.querySelectorAll('.cyber-tubes .line');
  let start = null;

  function animateWave(timestamp) {
    if (!start) start = timestamp;
    let progress = (timestamp - start) / 1000;

    lines.forEach((line, index) => {
      let offset = index * Math.PI / 1.5;
      let wave = Math.sin(progress + offset) * 20;
      line.style.transform = `translateY(calc(50% + ${wave}px))`;
    });

    requestAnimationFrame(animateWave);
  }

  requestAnimationFrame(animateWave);