export type TimeState = 'past' | 'present' | 'future';

export interface TimelineStep {
    id: TimeState;
    /** Tab label (Passé / Présent / Futur) */
    label: string;
    title: string;
    content: string;
    /** CSS color (design token) of the period title */
    accent: string;
}

export interface NavItem {
    id: 'about' | 'skills' | 'projects';
    label: string;
    path: string;
}

export interface CvFile {
    /** File name inside /public */
    file: string;
    /** Name proposed to the visitor when downloading */
    downloadName: string;
}

export interface HoloCardLabels {
    status: string;
    initials: string;
    name: string;
    role: string;
    serial: string;
    uploading: string;
    cta: string;
}

export interface ProjectLabels {
    demo: string;
    code: string;
    wipRibbon: string;
    wipBadge: string;
}

export interface Skill {
    name: string;
    level: number; // 0-100
    icon?: string;
}

export interface SkillCategory {
    id: string;
    title: string;
    skills: Skill[];
}

export interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    tags: string[];
    demoLink?: string;
    repoLink?: string;
    featured?: boolean;
    color?: string;
}

export interface ReferenceLink {
    label: string;
    url: string;
    context: string;
}

export interface UiLabels {
    /** Accessible name of the home orbital navigation */
    mainNavLabel: string;
    /** Accessible name of the HoloCard download action */
    cvDownloadLabel: string;
    /** Back-to-home button of the inner pages */
    backLabel: string;
}

export interface PortfolioContent {
    ui: UiLabels;
    nav: NavItem[];
    cv: CvFile;
    home: {
        title: string;
        subtitle: string;
    };
    about: {
        title: string;
        timeline: TimelineStep[];
    };
    skills: {
        title: string;
        intro: string;
        categories: SkillCategory[];
        holoCard: HoloCardLabels;
    };
    projects: {
        title: string;
        labels: ProjectLabels;
        list: Project[];
    };
    links: ReferenceLink[];
}
