const canvas = document.getElementById('grid');
  const ctx = canvas.getContext('2d');

  const GRID_COLOR = '#ff0080';
  const GRID_SPACING = 150;
  const HORIZON_HEIGHT_RATIO = 0.6;

  let time2 = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const horizonY = canvas.height * HORIZON_HEIGHT_RATIO;
    const maxDepth = canvas.height - horizonY;

    // Pulsation 
    let cycle = 4;
    let pulseTime = time2 % cycle;
    let fadeDuration = 2;  // durée d'allumage/extinction

    if (pulseTime < fadeDuration / 2) {
        pulse = pulseTime / (fadeDuration / 2);  // fade in
    } else if (pulseTime > cycle - fadeDuration / 2) {
        pulse = (cycle - pulseTime) / (fadeDuration / 2);  // fade out
    } else {
        pulse = 1;  // allumé
    }


    ctx.lineCap = 'round';

    // === Lignes horizontales ===
    for (let y = 0; y <= maxDepth; y += GRID_SPACING) {
      let scaledY = horizonY + y;
      let alpha = (scaledY - horizonY) / (canvas.height - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, scaledY);
      ctx.lineTo(canvas.width, scaledY);

        ctx.strokeStyle = `rgba(${hexToRGB(GRID_COLOR)}, ${alpha * pulse})`;
        ctx.stroke();

    }

    // === Lignes verticales tracées par segments ===
    const step = GRID_SPACING;
    const totalLines = Math.ceil(canvas.width / step) * 1.25;
    const segmentCount = 50;  // nombre de sous-segments pour opacité progressive
    for (let i = -totalLines; i <= totalLines; i++) {
        let offset = step / 2;
        let startX = canvas.width / 2 + i * step + offset;
        let endX = canvas.width / 2 + (i * step * 0.05);
        let startY = canvas.height;
        let endY = horizonY;

        if (endY >= startY) continue;

        const segmentCount = 50;  // plus = plus fluide

        for (let s = 0; s < segmentCount; s++) {
            let t1 = s / segmentCount;
        let t2 = (s + 1) / segmentCount;
        if (t2 > 1) t2 = 1;  // sécurise la fin

        let x1 = startX + (endX - startX) * t1;
        let y1 = startY + (endY - startY) * t1;
        let x2 = startX + (endX - startX) * t2;
        let y2 = startY + (endY - startY) * t2;

        if (y1 === y2) continue;  // saute les doublons

        let alpha = (y1 - horizonY) / (canvas.height - horizonY);
        alpha = Math.max(0, Math.min(1, alpha));

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${hexToRGB(GRID_COLOR)}, ${alpha * pulse})`;
        ctx.stroke();

        }
    }
  }

  function hexToRGB(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  function animateGrid() {
    time2 += 0.01;
    drawGrid();
    requestAnimationFrame(animateGrid);
  }
  animateGrid();