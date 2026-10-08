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
    cv: {
        file: "cv_resume.pdf",
        downloadName: "Corentin_FANIC_CV.pdf"
    },
    home: {
        title: "Corentin FANIC",
        roles: ["Développeur Full Stack", "Expert SI", "DevOps"],
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
                content: `Né aux Sables-d'Olonne, j'ai grandi à la campagne. J'ai toujours été attiré par les activités qui stimulent mon raisonnement et ma logique. Que ce soient les sciences, la cinématographie, les échecs ou les jeux vidéo, ces passions ont façonné mon esprit analytique. Mon entourage familial et amical a été important pour moi et m'a aidé à garder les pieds sur terre.
Passionné par les sports, à l'âge de 12 ans j'ai commencé à pratiquer le rugby à XV au [Rugby Club Sablais (R.C.S.)](https://rc-sablais.ffr.fr/). Cette expérience au niveau national m'a enseigné la discipline, la cohésion d'équipe et la persévérance, des valeurs qui m'accompagnent encore aujourd'hui.
Après avoir obtenu un baccalauréat général scientifique, j'ai exploré diverses voies professionnelles. J'ai entamé une formation en école d'ergothérapie puis j'ai finalement travaillé comme serveur et barman dans l'hôtellerie-restauration. Enfin, je suis devenu informaticien développeur.`
            },
            {
                id: "present",
                label: "Présent",
                accent: "var(--neon-azure)",
                date: null,
                title: "Qui je suis",
                content: `Actuellement, je suis détenteur d'un bachelor informatique délivré par le CNAM et je collabore au sein d'une petite ESN. Je consacre la majeure partie de mon temps à travailler et à acquérir un maximum de compétences dans ce domaine. Je partage ma vie avec ma compagne, qui me soutient énormément dans mes projets. Retrouvez mon parcours sur [LinkedIn](https://www.linkedin.com/in/corentin-fanic-832630293).`
            },
            {
                id: "future",
                label: "Futur",
                accent: "var(--neon-violet)",
                date: "2035-06-14T16:29",
                title: "Qui je serai",
                content: `J'aimerais faire une carrière utile grâce à mes compétences et expériences en tant que [DevOps](https://www.opiiec.fr/metiers/139882-specialiste-devops#:~:text=Finalit%C3%A9%20du%20m%C3%A9tier,monitoring%20des%20performances%20des%20applications). Ce domaine me permet de m'éclater, ce qui me donne la détermination nécessaire pour atteindre mon objectif. Plutôt qu'un diplôme de plus, je fais le choix de l'expérience\u00a0: accumuler les projets concrets, maîtriser les subtilités du monde du travail et gravir les échelons autant que possible.
Mon objectif à long terme est de gérer un SI complet ou d'être responsable de projet de développement.`
            }
        ]
    },
    skills: {
        title: "Compétences",
        holoCard: {
            status: "CLEARANCE: LEVEL 5",
            initials: "CF",
            name: "CORENTIN FANIC",
            role: "FULLSTACK DEVELOPER",
            serial: "ID-CF-2026-FSK",
            uploading: "UPLOADING TO NEURAL LINK...",
            cta: "[ CLICK TO DOWNLOAD CV ]"
        },
        intro: `Au cours de ma formation et de mes projets récents, j'ai forgé une base technique solide en alliant théorie et mise en pratique intensive.
Côté Frontend, j'ai évolué vers une expertise moderne centrée sur l'architecture de composants (React.js) et le typage strict (TypeScript). Je maîtrise l'écosystème de build actuel (Vite, npm) et la création d'interfaces réactives et animées (SCSS Modules, Framer Motion, Bootstrap).
Sur le Backend, je concois des architectures robustes et sécurisées (MVC, API RESTful) en utilisant PHP/Symfony et Java. J'assure la persistance et l'intégrité des données via des SGBD relationnels (MySQL, SQL Server) et NoSQL (MongoDB), en m'appuyant sur des ORM comme Doctrine.
Mon approche est résolument DevOps et Agile. Au-delà du simple versioning avec Git/GitHub, je mets en place des pipelines d'intégration continue (CI/CD via GitHub Actions) et j'utilise Docker pour la conteneurisation. Sensible à la qualité et à la sécurité, j'applique les standards OWASP, réalise des tests d'API (Postman) et collabore efficacement via des outils comme Jira ou Trello.`,
        categories: [
            {
                id: "frontend",
                title: "Frontend",
                skills: [
                    { name: "React / Vite", level: 85 },
                    { name: "TypeScript", level: 80 },
                    { name: "SCSS", level: 90 },
                    { name: "JavaScript", level: 85 },
                    { name: "Bootstrap / Tailwind", level: 80 }
                ]
            },
            {
                id: "backend",
                title: "Backend",
                skills: [
                    { name: "Node.js", level: 75 },
                    { name: "PHP / Symfony / Laravel", level: 80 },
                    { name: "Python", level: 70 },
                    { name: "SQL (MySQL)", level: 95 },
                    { name: "API REST", level: 80 }
                ]
            },
            {
                id: "tools",
                title: "Outils & DevOps",
                skills: [
                    { name: "Git / GitHub", level: 85 },
                    { name: "Docker", level: 60 },
                    { name: "FTP", level: 85 },
                    { name: "IDE", level: 95 },
                    { name: "Hebergement", level: 95 },
                    { name: "Jenkins", level: 80 }
                ]
            }
        ],
        // Skills of the CV of 2026-09-17 only (F3), grouped as validated on 2026-10-08;
        // icon: Simple Icons slug, null when the logo does not exist there (generic logo)
        groups: [
            {
                id: "front",
                title: "Front-end",
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
                    { name: "IDE classiques & agentiques", icon: null },
                    { name: "LLM & MCP", icon: "modelcontextprotocol" },
                    { name: "FileZilla", icon: "filezilla" },
                    { name: "MobaXterm", icon: null },
                    { name: "WinSCP", icon: null },
                    { name: "OVH", icon: "ovh" },
                    { name: "O2Switch", icon: null },
                    { name: "PlanetHoster", icon: null }
                ]
            }
        ],
        // F4 projects as Skills links them, by their tags (merged with projects.list in LOT 5)
        projects: [
            { id: "memory", title: "MemoryGame", tags: ["JavaScript", "CSS", "DOM"] },
            { id: "solar", title: "SolarSystem", tags: ["JavaScript", "Three.js", "CSS"] },
            { id: "first-portfolio", title: "First Portfolio", tags: ["CSS", "JavaScript", "Legacy"] },
            { id: "soulsweeper", title: "SoulSweeper", tags: ["C#", "Unity"] }
        ]
    },

    projects: {
        title: "Projets",
        labels: {
            demo: "Demo",
            code: "Code",
            wipRibbon: "EN TRAVAUX",
            wipBadge: "🚧 WIP"
        },
        list: [
            {
                id: "ifto",
                title: "Site IFTO",
                description: "Refonte complète du site de l'Institut de Formation en Thérapies Manuelles. Gestion de contenu dynamique et administration.",
                demoLink: "https://www.ifto.fr/",
                tags: ["Wordpress", "PHP", "MySQL", "Bootstrap"],
                featured: true,
                color: "#ffaa00"
            },
            {
                id: "memory",
                title: "MemoryGame",
                description: "Jeu de mémoire classique développé en JavaScript. Travail sur la logique DOM et les animations CSS.",
                demoLink: "https://cocofafa85.github.io/EnglishMemory/Memory.html",
                tags: ["JavaScript", "CSS", "DOM"],
                repoLink: "https://github.com/cocofafa85/EnglishMemory",
                color: "#bc13fe"
            },
            {
                id: "solar",
                title: "SolarSystem",
                description: "Simulation à l'échelle du temps et de l'espace du système solaire en CSS et Three.JS .",
                demoLink: "https://cocofafa85.github.io/SolarSystem/index.html",
                repoLink: "https://github.com/CocoFafa85/SolarSystem",
                tags: ["CSS", "JavaScript"],
                color: "#0aff0a"
            },
            {
                id: "first-portfolio",
                title: "First Portfolio",
                description: "Mon premier portfolio homemade. Une archive sentimentale.",
                demoLink: "https://cocofafa85.github.io/PortfolioFirst/index.html",
                repoLink: "https://github.com/CocoFafa85/PortfolioFirst",
                tags: ["CSS", "JavaScript", "Legacy"],
                color: "#2962ff"
            },
            {
                id: "demineur",
                title: "Démineur 2.0",
                description: "Réinterprétation moderne du célèbre jeu Démineur avec des niveaux de difficulté progressifs.",
                tags: ["React", "TypeScript", "Vite", "SQLite"],
                featured: true,
                color: "#ff0055"
            }
        ]
    },
    notFound: {
        code: "ERREUR 404",
        title: "Signal perdu",
        message: "Cette adresse ne mène nulle part : la transmission s'est perdue dans la matrice.",
        cta: "Retour à l'accueil"
    }
};
