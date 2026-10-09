import type { ProjectDetails, ProjectId, ProjectVisual } from '../types/models';
import visuals from './projectVisuals.json';
// Visuals: scripts/capture-demos.mjs (npm run gen:visuals), WebP in the widths of projectVisuals.json, 16:10
import memory640 from '../assets/projects/memory-640.webp';
import memory960 from '../assets/projects/memory-960.webp';
import first640 from '../assets/projects/first-portfolio-640.webp';
import first960 from '../assets/projects/first-portfolio-960.webp';
import solar640 from '../assets/projects/solar-640.webp';
import solar960 from '../assets/projects/solar-960.webp';
import soul640 from '../assets/projects/soulsweeper-640.webp';
import soul960 from '../assets/projects/soulsweeper-960.webp';
import pouce640 from '../assets/projects/poucestop-640.webp';
import pouce960 from '../assets/projects/poucestop-960.webp';

const [SMALL, LARGE] = visuals.widths;
const visual = (small: string, large: string, alt: string): ProjectVisual => ({
    sources: [{ src: small, width: SMALL }, { src: large, width: LARGE }],
    width: visuals.width,
    height: visuals.height,
    alt,
});

/**
 * What only the Projects page shows of each project (F4, F5; texts of Corentin, light polish validated
 * on 2026-10-09). Imported by the Projects chunk alone: the shared bundle keeps only the list
 * (content.projects.list). `satisfies` makes the build fail on a project without details or details
 * without a project.
 */
export const projectDetails = {
    memory: {
        pitch: "Améliorer l'usage des conjugaisons et de la grammaire anglaises, de façon ludique.",
        team: "Solo",
        goals: ["Découvrir le JavaScript"],
        frame: "cocofafa85.github.io/EnglishMemory",
        color: "#bc13fe",
        visual: visual(memory640, memory960, "Capture de MemoryGame en cours de partie : grille de cartes où trois paires de temps anglais et leurs phrases ont été trouvées, tableau de bord avec le temps, les coups et la difficulté."),
        demoLink: "https://cocofafa85.github.io/EnglishMemory/Memory.html",
        repoLink: "https://github.com/cocofafa85/EnglishMemory"
    },
    "first-portfolio": {
        pitch: "Mon premier portfolio, comme son nom l'indique.",
        team: "Solo",
        goals: ["Concevoir un site à mon image, tout en restant professionnel"],
        frame: "cocofafa85.github.io/PortfolioFirst",
        color: "#2962ff",
        visual: visual(first640, first960, "Capture de First Portfolio : « Corentin FANIC, Développeur full stack » sur un dégradé corail, entouré de quatre portes des étoiles, au-dessus d'une grille en perspective."),
        demoLink: "https://cocofafa85.github.io/PortfolioFirst/index.html",
        repoLink: "https://github.com/CocoFafa85/PortfolioFirst"
    },
    solar: {
        pitch: "Prendre la mesure, de façon interactive, de l'immensité des échelles astronomiques ; revoir et apprendre des notions d'astronomie.",
        team: "Solo",
        goals: ["Approfondir le JavaScript", "Prendre en main un framework 3D", "Appliquer des formules mathématiques"],
        frame: "cocofafa85.github.io/SolarSystem",
        color: "#0aff0a",
        visual: visual(solar640, solar960, "Capture de SolarSystem : Saturne et ses anneaux en 3D, avec sa fiche de données (masse, rayon, rotation, période orbitale, température) et les commandes de la simulation."),
        demoLink: "https://cocofafa85.github.io/SolarSystem/index.html",
        repoLink: "https://github.com/CocoFafa85/SolarSystem"
    },
    // No link while it is a work in progress (F5)
    soulsweeper: {
        pitch: "J'ai toujours aimé le démineur ; j'ai voulu le réinventer sous la forme d'un genre de jeu vidéo que j'affectionne : le roguelike.",
        team: "Solo",
        goals: ["Découvrir la stack C# + Unity", "Mettre en pratique la POO", "Créer mon premier jeu complet"],
        frame: "SoulSweeper · Unity",
        color: "#ff0055",
        visual: visual(soul640, soul960, "Illustration de SoulSweeper : une grille de démineur dans un donjon éclairé par deux torches, une âme lumineuse au centre, des drapeaux et une mine ; trois cœurs et « Étage 3 » en haut, le titre en bas.")
    },
    poucestop: {
        pitch: "[À FOURNIR : pitch de PouceStop]",
        team: "[À FOURNIR : équipe]",
        goals: ["[À FOURNIR : objectifs d'apprentissage]"],
        frame: "PouceStop · Android",
        color: "#ffb21a",
        visual: visual(pouce640, pouce960, "Illustration de PouceStop : un téléphone affichant un trajet sur une carte, devant une route de nuit et un panneau marqué d'un pouce levé.")
    }
} satisfies Record<ProjectId, ProjectDetails>;
