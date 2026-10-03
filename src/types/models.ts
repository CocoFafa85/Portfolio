export interface TimelineStep {
    id: string;
    title: string;
    content: string;
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
}

export interface PortfolioContent {
    ui: UiLabels;
    home: {
        title: string;
        subtitle: string;
    };
    about: {
        timeline: TimelineStep[];
    };
    skills: {
        intro: string;
        categories: SkillCategory[];
    };
    projects: {
        list: Project[];
    };
    links: ReferenceLink[];
}
