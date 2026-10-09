import type { ProjectDetails, ProjectId } from '../types/models';

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
        demoLink: "https://cocofafa85.github.io/EnglishMemory/Memory.html",
        repoLink: "https://github.com/cocofafa85/EnglishMemory"
    },
    "first-portfolio": {
        pitch: "Mon premier portfolio, comme son nom l'indique.",
        team: "Solo",
        goals: ["Concevoir un site à mon image, tout en restant professionnel"],
        frame: "cocofafa85.github.io/PortfolioFirst",
        color: "#2962ff",
        demoLink: "https://cocofafa85.github.io/PortfolioFirst/index.html",
        repoLink: "https://github.com/CocoFafa85/PortfolioFirst"
    },
    solar: {
        pitch: "Prendre la mesure, de façon interactive, de l'immensité des échelles astronomiques ; revoir et apprendre des notions d'astronomie.",
        team: "Solo",
        goals: ["Approfondir le JavaScript", "Prendre en main un framework 3D", "Appliquer des formules mathématiques"],
        frame: "cocofafa85.github.io/SolarSystem",
        color: "#0aff0a",
        demoLink: "https://cocofafa85.github.io/SolarSystem/index.html",
        repoLink: "https://github.com/CocoFafa85/SolarSystem"
    },
    // No link while it is a work in progress (F5)
    soulsweeper: {
        pitch: "J'ai toujours aimé le démineur ; j'ai voulu le réinventer sous la forme d'un genre de jeu vidéo que j'affectionne : le roguelike.",
        team: "Solo",
        goals: ["Découvrir la stack C# + Unity", "Mettre en pratique la POO", "Créer mon premier jeu complet"],
        frame: "SoulSweeper · Unity",
        color: "#ff0055"
    },
    poucestop: {
        pitch: "[À FOURNIR : pitch de PouceStop]",
        team: "[À FOURNIR : équipe]",
        goals: ["[À FOURNIR : objectifs d'apprentissage]"],
        frame: "PouceStop · Android",
        color: "#ffb21a"
    }
} satisfies Record<ProjectId, ProjectDetails>;
