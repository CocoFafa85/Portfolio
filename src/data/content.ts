import { PortfolioContent } from '../types/models';

export const content: PortfolioContent = {
    ui: {
        mainNavLabel: "Navigation principale",
        orbitNavLabel: "Menu orbital",
        monogram: "CF",
        homeLabel: "Accueil",
        cvDownloadLabel: "Télécharger le CV de Corentin FANIC (PDF)",
        locale: "fr-FR"
    },
    decor: {
        circuit: { chip: "U", resistor: "R", capacitor: "C" },
        decodeGlyphs: "01<>/\\[]{}#$%&*+=?ABCDEFHKLMNPRSTUVXZ",
        timeCircuits: {
            plates: { future: "DESTINATION TIME", present: "PRESENT TIME", past: "LAST TIME DEPARTED" },
            fields: { month: "MONTH", day: "DAY", year: "YEAR", hour: "HOUR", minute: "MIN", am: "AM", pm: "PM" },
            months: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
            speedUnit: "MPH",
            capacitor: "FLUX CAPACITOR"
        }
    },
    nav: [
        { id: "about", label: "About", path: "/about" },
        { id: "skills", label: "Skills", path: "/skills" },
        { id: "projects", label: "Projects", path: "/projects" }
    ],
    profiles: {
        linkedin: "https://www.linkedin.com/in/corentin-fanic-832630293"
    },
    cv: {
        file: "cv_resume.pdf",
        downloadName: "Corentin_FANIC_CV.pdf"
    },
    home: {
        title: "Corentin FANIC",
        roles: ["Full Stack", "Génie logiciel", "DevOps"],
        rolesSeparator: " · "
    },
    about: {
        erasLabel: "Époques",
        rowOrder: ["future", "present", "past"],
        presentFallback: "2026-09-05T00:00",
        timeline: [
            {
                id: "past",
                label: "Passé",
                accent: "var(--neon-pink)",
                date: "2015-05-01T22:04",
                title: "Qui j'étais",
            },
            {
                id: "present",
                label: "Présent",
                accent: "var(--neon-cyan)",
                date: null,
                title: "Qui je suis",
            },
            {
                id: "future",
                label: "Futur",
                accent: "var(--neon-violet)",
                date: "2035-06-14T16:29",
                title: "Qui je serai",
            }
        ]
    },
    skills: {
        title: "Compétences",
        holoCard: {
            status: "CLEARANCE: LEVEL 5",
            name: "CORENTIN FANIC",
            role: "FULLSTACK DEVELOPER",
            serial: "ID-CF-2026-FSK",
            uploading: "UPLOADING TO NEURAL LINK...",
            granted: "ACCÈS AUTORISÉ",
            download: "Télécharger le CV",
            toBack: "Verso",
            toFront: "Recto",
            qrCaption: "LINKEDIN · CORENTIN FANIC",
            qrHint: "Scanner ou cliquer le code",
            qrAlt: "QR code du profil LinkedIn de Corentin FANIC",
            started: "Téléchargement du CV lancé"
        },
        labels: {
            railTitle: "Projets",
            railHint: "Survolez une technologie\u00a0: ses projets s'allument.",
            usedIn: "Utilisé dans\u00a0:",
            noProject: "Pas encore de projet public",
            professional: "Professionnel"
        },
        lead: "Au cours de ma formation et de mes projets récents, j'ai forgé une base technique solide en alliant théorie et mise en pratique intensive.",
        // Skills of the CV of 2026-09-17 only (F3), grouped as validated on 2026-10-08;
        // intro: the author's text validated on 2026-10-08 (S1), keywords **like this**;
        // icon: Simple Icons slug, null when the logo does not exist there (generic logo)
        groups: [
            {
                id: "front",
                title: "Front-end",
                intro: "J'ai évolué vers une expertise moderne centrée sur l'architecture de composants (**React**, **Angular**) et le typage strict (**TypeScript**). Je crée des interfaces réactives et animées.",
                skills: [
                    { name: "TypeScript", icon: "typescript" },
                    { name: "React", icon: "react" },
                    { name: "Angular", icon: "angular" },
                    { name: "JavaScript", icon: "javascript" },
                    { name: "Three.js", icon: "threedotjs" },
                    { name: "CSS", icon: "css" },
                    { name: "Bootstrap", icon: "bootstrap" },
                    { name: "Tailwind", icon: "tailwindcss" }
                ]
            },
            {
                id: "back",
                title: "Back-end & langages",
                intro: "Je conçois des architectures robustes et sécurisées (MVC, API RESTful) en utilisant **PHP/Symfony** et **Java**.",
                skills: [
                    { name: "PHP", icon: "php" },
                    { name: "Symfony", icon: "symfony" },
                    { name: "Doctrine", icon: "doctrine" },
                    { name: "Java", icon: null },
                    { name: "JUnit 5", icon: "junit5" },
                    { name: "Swing", icon: null },
                    { name: "Kotlin", icon: "kotlin" },
                    { name: "C#", icon: null },
                    { name: "C++", icon: "cplusplus" },
                    { name: "Python", icon: "python" },
                    { name: "Bash", icon: "gnubash" }
                ]
            },
            {
                id: "game",
                title: "Jeu vidéo",
                skills: [
                    { name: "C#", icon: null },
                    { name: "Unity", icon: "unity" }
                ]
            },
            {
                id: "data",
                title: "Données",
                intro: "J'assure la persistance et l'intégrité des données via des SGBD relationnels (**MySQL**, **SQL Server**) et NoSQL (**MongoDB**), en m'appuyant sur des ORM comme **Doctrine**.",
                skills: [
                    { name: "SQL", icon: null },
                    { name: "MySQL", icon: "mysql" },
                    { name: "SQL Server", icon: null },
                    { name: "HFSQL", icon: null },
                    { name: "MongoDB", icon: "mongodb" },
                    { name: "JSON", icon: "json" },
                    { name: "XML", icon: "xml" }
                ]
            },
            {
                id: "devops",
                title: "DevOps, qualité & sécurité",
                intro: "Mon approche est résolument **DevOps** et **Agile**. Au-delà du simple versioning avec **Git/GitHub**, je mets en place des pipelines d'intégration continue (CI/CD avec **Jenkins**) et j'utilise **Docker** pour la conteneurisation. Sensible à la qualité et à la sécurité, j'applique les standards **OWASP** et **SSDF**, automatise mes tests (**Selenium**, **Playwright**) et collabore efficacement via des outils comme **Jira** ou **Trello**.",
                skills: [
                    { name: "Linux", icon: "linux" },
                    { name: "Git", icon: "git" },
                    { name: "GitHub", icon: "github" },
                    { name: "Jenkins", icon: "jenkins" },
                    { name: "Docker", icon: "docker" },
                    { name: "CI / CD", icon: null },
                    { name: "IaaS", icon: null },
                    { name: "CaaS", icon: null },
                    { name: "Selenium", icon: "selenium" },
                    { name: "Playwright", icon: null },
                    { name: "OWASP", icon: "owasp" },
                    { name: "SSDF", icon: null }
                ]
            },
            {
                id: "tools",
                title: "Outils & méthodes",
                skills: [
                    { name: "Agile", icon: null },
                    { name: "DevOps", icon: null },
                    { name: "Cycle en V", icon: null },
                    { name: "Jira", icon: "jira" },
                    { name: "Trello", icon: "trello" },
                    { name: "Figma", icon: "figma" },
                    { name: "IDE classiques & agentiques", icon: null, aliases: ["Android Studio"] },
                    { name: "LLM & MCP", icon: "modelcontextprotocol" },
                    { name: "FileZilla", icon: "filezilla" },
                    { name: "MobaXterm", icon: null },
                    { name: "WinSCP", icon: null },
                    { name: "OVH", icon: "ovh" },
                    { name: "O2Switch", icon: null },
                    { name: "PlanetHoster", icon: null }
                ]
            }
        ]
    },

    projects: {
        title: "Projets",
        labels: {
            demo: "Démo",
            code: "Code",
            linkSuffix: " de {title} (nouvel onglet)",
            plannedYear: "Sortie prévue en {year}",
            year: "Année",
            team: "Équipe",
            goals: "Objectifs",
            online: "En ligne",
            inProgress: "En développement — sortie prévue en {year}",
            undated: "En développement"
        },
        // The single list of the projects (F4, LOT 5), in the validated order: read by the Projects page
        // (with its details, src/data/projectDetails.ts) and by the skills (rail and badges of Skills).
        // PouceStop: data of 2026-10-10 (in development, no release date)
        list: [
            { id: "memory", title: "MemoryGame", tags: ["JavaScript", "CSS", "DOM"], status: "done", year: "2024" },
            { id: "first-portfolio", title: "First Portfolio", tags: ["CSS", "JavaScript", "Legacy"], status: "done", year: "2025" },
            { id: "solar", title: "SolarSystem", tags: ["JavaScript", "Three.js", "CSS"], status: "done", year: "2025" },
            { id: "soulsweeper", title: "SoulSweeper", tags: ["C#", "Unity"], status: "in-progress", year: "2026" },
            { id: "poucestop", title: "PouceStop", tags: ["Kotlin", "Android Studio"], status: "in-progress" }
        ]
    },
    notFound: {
        code: "ERREUR 404",
        title: "Signal perdu",
        message: "Cette adresse ne mène nulle part : la transmission s'est perdue dans la matrice.",
        cta: "Retour à l'accueil"
    }
};
