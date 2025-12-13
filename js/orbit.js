const buttons = document.querySelectorAll('.orbiter');
const center = document.getElementById('center-title');

// === Paramètres personnalisables ===
let orbitRadius;              // distance du h1
let amplitudeY = 15;         // flottement vertical
let speed = 0.001;            // vitesse de rotation
let ellipseFactor ;       // ellipse horizontale

// === État interne ===
let angles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];  // 4 positions équidistantes
let time = 0;
let slowdown = 1;  // Multiplicateur de vitesse (ralenti au survol)

// === Position souris ===
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// === Gestion de la souris ===
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// === Survol bouton => ralentissement ===
buttons.forEach(btn => {
  btn.addEventListener('mouseenter', () => slowdown = 0.05);
  btn.addEventListener('mouseleave', () => slowdown = 1);
});

function animate() {
  const centerBox = center.getBoundingClientRect();
  const cx = centerBox.left + centerBox.width / 2;
  const cy = centerBox.top + centerBox.height / 2;

  buttons.forEach((btn, i) => {
    // Avance de l'angle avec ralentissement
    angles[i] += speed * slowdown;

    // Position orbitale sinusoïdale
    const angle = angles[i];
    let  x = cx + Math.cos(angle) * (orbitRadius * ellipseFactor); 
    const y = cy + Math.sin(angle) * (orbitRadius * 0.7) + Math.sin(time + i) * amplitudeY;

    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;

    // effet de rotation 
    btn.style.transform = `translate(-50%, -50%) `;
  });

  time += 0.03;
  requestAnimationFrame(animate);
}



// Responsive Telephone & tablette
function responsiveDesign() {
  if (window.innerWidth <= 550) {
    orbitRadius = 290;
    ellipseFactor = 0.5;
  } else if ((window.innerWidth > 550) && (window.innerWidth <= 1365)) {
    orbitRadius = 290;
    ellipseFactor = 1;
  } else {
    orbitRadius = 310;
    ellipseFactor = 2;
  }
}

animate();

window.addEventListener('resize', responsiveDesign);
responsiveDesign(); // Appel initial



