const steps = [
    {
      img: "../textures/convecteurTemporel1.png",
      text: "<span style='font-weight: bold; font-size:1em'>Qui j'étais</span></br></br><span style='font-size:1vw'>Né aux Sables d'Olonne, j'ai grandi à la campagne. J'ai toujours été attiré par les activités qui stimulent mon raisonnement et ma logique. Que ce soit les sciences, la cinématopgrahie, les échecs ou les jeux vidéo, ces passions ont façonné mon esprit analytique. Mon entourage familial et amical a été important pour moi et m'a aidé à garder les pieds sur terre.</br></br>Passionné par les sports, à l'âge de 12 ans j'ai commencé à pratiquer le rugby à XV au rugby club sablais (R.C.S). Cette expérience au niveau national m'a enseigné la discipline, la cohésion d'équipe et la persévérance, des valeurs qui m'accompagnent encore aujourd'hui.</br></br>Après avoir obtenu un baccalauréat général scientifique, j'ai exploré diverses voies professionnelles. J'ai entamé une fromation en école d'ergothérapie puis j'ai finalement travaillé comme serveur et barman dans l'hôtellerie-restauration puis j'ai mûri mon projet actuel.</span>",
      show: ["link-rcs"],
      hide: ["link-linkedin", "logo-dev"]
    },
    {
      img: "../textures/convecteurTemporel2.png",
      text: "<span style='font-weight: bold; font-size:1em'>Qui je suis</span></br></br><span style='font-size:1vw'>Actuellement, je suis étudiant à Cholet (49) dans le domaine de la programmation informatique, en cycle BTS SIO. Je souhaite poursuivre vers une troisième année de bachelor en alternance. Je consacre la majeure partie de mon temps à travailler et à acquérir un maximum de compétences dans ce domaine.</br></br>En parallèle, je réalise des missions rémunérées pour financer ma vie étudiante. Une vie que je partage avec ma compagne infirmière qui me soutient énormément dans mon projet.</span>",
      show: ["link-rcs", "link-linkedin"],
      hide: ["logo-dev"]
    },
    {
      img: "../textures/convecteurTemporel3.png",
      text: "<span style='font-weight: bold; font-size:1em'>Qui je serai</span></br></br><span style='font-size:1vw'>Une fois mon cursus terminé et mon niveau de programmation au top, je me lancerai dans une carrière de développeur informatique full stack. Ce domaine me permet de m'éclater ce qui me donne la détermination nécessaire pour atteindre mon objectif. Bien que mon niveau d'étude restera à BAC+3, je compte accumuler de l'expérience et maîtriser les subtilités du monde du travail pour gravir les échelons autant que possible.</br></br> Mon objectif à long terme est d'avoir une fonction de responsable comme product owner.</span>",
      show: ["link-rcs", "link-linkedin", "logo-dev"],
      hide: []
    }
  ];
  
  const convectorImg = document.getElementById("convector-img");
  const description = document.getElementById("description");
  const links = {
    "link-rcs": document.getElementById("link-rcs"),
    "link-linkedin": document.getElementById("link-linkedin"),
    "logo-dev": document.getElementById("logo-dev")
  };
  
  let currentStep = 0;
  
  function updateView() {
    console.log("updateView called"); // DEBUG
  
    const nextStep = (currentStep + 1) % steps.length;
  
    // MAJ image convecteur
    convectorImg.src = steps[nextStep].img;
  
    // FADE texte
    description.classList.remove("show");
  
    setTimeout(() => {
      description.innerHTML = steps[nextStep].text;
      description.classList.add("show");
    }, 200);
  
    // Affiche éléments show[]
    steps[nextStep].show.forEach(id => {
      const el = links[id];
      if (el) {
        el.style.display = "inline-block";
        el.style.visibility = "visible";
        setTimeout(() => el.classList.add("show"), 50);
      }
    });
  
    // Masque éléments hide[]
    steps[nextStep].hide.forEach(id => {
      const el = links[id];
      if (el) {
        el.classList.remove("show");
        setTimeout(() => {
          el.style.display = "none";
          el.style.visibility = "hidden";
        }, 300);
      }
    });
  
    currentStep = nextStep;
  }
  
  // Initialisation à chargement
  window.onload = () => {
    console.log("Page loaded"); 
    description.classList.add("show");
    Object.values(links).forEach(el => {
      if (el && el.style.display !== "none") {
        el.classList.add("show");
      }
    });
  
    // ⛳ Assure que l'écouteur s'attache bien
    const btn = document.getElementById("convector-btn");
    if (btn) {
      btn.addEventListener("click", updateView);
    } else {
      console.warn("⚠️ Bouton non trouvé dans le DOM !");
    }
  };
  