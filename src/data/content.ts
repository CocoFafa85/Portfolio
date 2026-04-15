import { PortfolioContent } from '../types/models';

export const content: PortfolioContent = {
    home: {
        title: "Corentin FANIC",
        subtitle: "Développeur full stack"
    },
    about: {
        timeline: [
            {
                id: "past",
                title: "Qui j'étais",
                content: `Né aux Sables d'Olonne, j'ai grandi à la campagne. J'ai toujours été attiré par les activités qui stimulent mon raisonnement et ma logique. Que ce soient les sciences, la cinématographie, les échecs ou les jeux vidéo, ces passions ont façonné mon esprit analytique. Mon entourage familial et amical a été important pour moi et m'a aidé à garder les pieds sur terre.
Passionné par les sports, à l'âge de 12 ans j'ai commencé à pratiquer le rugby à XV au [Rugby Club Sablais (R.C.S)](https://rc-sablais.ffr.fr/). Cette expérience au niveau national m'a enseigné la discipline, la cohésion d'équipe et la persévérance, des valeurs qui m'accompagnent encore aujourd'hui.
Après avoir obtenu un baccalauréat général scientifique, j'ai exploré diverses voies professionnelles. J'ai entamé une formation en école d'ergothérapie puis j'ai finalement travaillé comme serveur et barman dans l'hôtellerie-restauration. Enfin, je deviens un informaticien développeur.`
            },
            {
                id: "present",
                title: "Qui je suis",
                content: `Actuellement, je suis détenteur d'un BTS SIO et je poursuis ma voie en troisième année de bachelor en alternance. Je consacre la majeure partie de mon temps à travailler et à acquérir un maximum de compétences dans ce domaine. Je partage ma vie avec ma compagne qui me soutient énormément dans mes projets. Retrouvez mon parcours sur [LinkedIn](http://www.linkedin.com/in/corentin-fanic-832630293).`
            },
            {
                id: "future",
                title: "Qui je serai",
                content: `Une fois mon cursus terminé et mon niveau de connaissances au top, j'aimerais faire une carrière de [DevSecOps](https://www.opiiec.fr/metiers/139882-specialiste-devops#:~:text=Finalit%C3%A9%20du%20m%C3%A9tier,monitoring%20des%20performances%20des%20applications). Ce domaine me permet de m'éclater ce qui me donne la détermination nécessaire pour atteindre mon objectif. Bien que mon niveau d'étude restera à BAC+3, je compte accumuler de l'expérience et maîtriser les subtilités du monde du travail pour gravir les échelons autant que possible.
Mon objectif à long terme est d'avoir une fonction de responsable d'équipe ou de stratégie`
            }
        ]
    },
    skills: {
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
        ]
    },

    projects: {
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
                repoLink: "https://github.com/CocoFafa85/Portfolio",
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
    links: [
        { label: "RCS (Rugby)", url: "https://rc-sablais.ffr.fr/", context: "About Me — étape 1" },
        { label: "LinkedIn", url: "http://www.linkedin.com/in/corentin-fanic-832630293", context: "About Me — étape 2" },
        { label: "Logo Dev", url: "https://www.opiiec.fr/metiers/139882-specialiste-devops#:~:text=Finalit%C3%A9%20du%20m%C3%A9tier,monitoring%20des%20performances%20des%20applications", context: "About Me — étape 3" },
        { label: "CV (Drive)", url: "https://drive.google.com/file/d/1sC28J9-BasZtjzfEgMwkhs4ufT7h4SIa/view?usp=sharing", context: "Skills — anneau rotatif" },
        { label: "Compétences (Sheets)", url: "https://docs.google.com/spreadsheets/d/1Ii-8VC9w8osA8PfR65HRA1Mz1Ori7YOQ/edit?...", context: "Skills — texte" }
    ]
};
