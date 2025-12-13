const blocMario = document.getElementById('blocMario');
const infoText = document.getElementById('infoText');
const redPill = document.getElementById('redPill');
const bluePill = document.getElementById('bluePill');
const pullText = document.getElementById('pullText');
const pushText = document.getElementById('pushText');
const themeButton = document.getElementById('themeButton');
const themeText = document.getElementById('themeText');
let pulseInterval; 
let isMarioActive = false;

// Anmation bloc mario
blocMario.addEventListener('click', () => {
    isMarioActive = !isMarioActive;
    infoText.classList.toggle('visible', isMarioActive);
    infoText.classList.toggle('hidden', !isMarioActive);
    blocMario.src = isMarioActive ? '../textures/blocMario2.png' : '../textures/blocMario.png';
    blocMario.classList.toggle('no-animation', isMarioActive);
});

// Pillules Toggle + Matrix glitch
function toggleWithGlitch(img, textBlock) {
    img.classList.add('glitch');
    const label = img.nextElementSibling; // le span juste après l'image
    setTimeout(() => {
        img.classList.remove('glitch');
        const isVisible = textBlock.classList.contains('visible');  
        textBlock.classList.toggle('visible', !isVisible);
        textBlock.classList.toggle('hidden', isVisible);
        
        // Si texte visible, forcer label à rester affiché
        if (!isVisible) {
            label.style.opacity = '1';
        } else {
            label.style.opacity = '';
        }
    }, 400);
}

redPill.addEventListener('click', () => toggleWithGlitch(redPill, pullText));
bluePill.addEventListener('click', () => toggleWithGlitch(bluePill, pushText));



// Animation Thème 
function startPulse() {
    stopPulse(); // on nettoie avant au cas où
    pulseInterval = setInterval(() => {
      themeButton.classList.remove('pulse');
      void themeButton.offsetWidth; // Forcer reflow
      themeButton.classList.add('pulse');
    }, 4000); // 2s d'animation + 3s de pause
  }
  
  // Fonction pour stopper la pulse
  function stopPulse() {
    clearInterval(pulseInterval);
    themeButton.classList.remove('pulse');
  }
  
  // Lancer pulse dès le départ
  startPulse();
  
  // Gérer le clic sur le bouton
  themeButton.addEventListener('click', () => {
    themeText.classList.toggle('visible');
    themeText.classList.toggle('hidden');
  
    // Si le texte devient visible ➔ stop pulse
    if (themeText.classList.contains('visible')) {
      stopPulse();
    } else {
      startPulse();
    }
  });



