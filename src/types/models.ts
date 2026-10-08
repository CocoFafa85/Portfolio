export type TimeState = 'past' | 'present' | 'future';

export interface TimelineStep {
    id: TimeState;
    /** Tab label (Passé / Présent / Futur) */
    label: string;
    title: string;
    /** One paragraph per line; links written [label](https://…) */
    content: string;
    /** CSS color (design token) of the period title */
    accent: string;
    /** Date and time on the displays, local `YYYY-MM-DDTHH:mm`; null: the visitor's clock (the present) */
    date: string | null;
}

/** Decorative texts of the DeLorean time circuits (About, LOT 3), as in the film */
export interface TimeCircuitLabels {
    /** Plate under each row (DESTINATION TIME…), by era */
    plates: Record<TimeState, string>;
    /** Strips above the displays */
    fields: { month: string; day: string; year: string; hour: string; minute: string; am: string; pm: string };
    /** Three-letter months shown by the month display, January first */
    months: string[];
    speedUnit: string;
    capacitor: string;
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

/** A skill of the CV (F3): no level, no percentage (LOT 4) */
export interface SkillEntry {
    name: string;
    /** Simple Icons slug (src/data/generated/skillIcons.ts); null: generic logo */
    icon: string | null;
}

/** A group of skills, headed by its short intro when it has one (S1) */
export interface SkillGroup {
    id: string;
    title: string;
    /** Intro block in the author's voice; keywords written **like this** */
    intro?: string;
    skills: SkillEntry[];
}

/** A project as the skills see it: its technologies are its tags (F4) */
export interface ProjectRef {
    id: string;
    title: string;
    tags: string[];
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

export interface UiLabels {
    /** Accessible name of the site navigation bar */
    mainNavLabel: string;
    /** Accessible name of the home orbital navigation (distinct from the bar's) */
    orbitNavLabel: string;
    /** Monogram of the navigation bar home badge */
    monogram: string;
    /** Home link of the navigation bar (visible on desktop, accessible name everywhere) */
    homeLabel: string;
    /** Accessible name of the HoloCard download action */
    cvDownloadLabel: string;
    /** Language of dates spelled out for screen readers (BCP 47) */
    locale: string;
}

/** Silkscreen reference prefixes of the circuit background (U1, R12, C4...) */
export interface CircuitDesignators {
    chip: string;
    resistor: string;
    capacitor: string;
}

export interface PortfolioContent {
    ui: UiLabels;
    nav: NavItem[];
    /** Decorative texts drawn by the backgrounds */
    decor: {
        circuit: CircuitDesignators;
        /** Characters drawn while a text decodes (home title and subtitle) */
        decodeGlyphs: string;
        timeCircuits: TimeCircuitLabels;
    };
    cv: CvFile;
    home: {
        title: string;
        /** Subtitle words decoded one into the next (LOT 2, H2) */
        roles: string[];
        /** Joins the roles when they are shown together (reduced motion) */
        rolesSeparator: string;
    };
    about: {
        /** Accessible name of the era tabs (the rows of the time circuits) */
        erasLabel: string;
        /** Rows of the time circuits, top to bottom, as in the film: destination, present, last departed */
        rowOrder: TimeState[];
        /** Shown by the present row when the visitor's clock is unavailable (data F1), local `YYYY-MM-DDTHH:mm` */
        presentFallback: string;
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
    notFound: {
        code: string;
        title: string;
        message: string;
        cta: string;
    };
}
