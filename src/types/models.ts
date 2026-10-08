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

/** Texts of the HoloCard (Skills, LOT 4, S2): decorative print of an access badge, and its actions */
export interface HoloCardLabels {
    status: string;
    name: string;
    role: string;
    /** Printed under the barcode, which encodes it (Code 128) */
    serial: string;
    /** Progress line of the download sequence */
    uploading: string;
    /** Stamp printed when the download starts */
    granted: string;
    /** Visible text of the download button (its accessible name, ui.cvDownloadLabel, starts with it) */
    download: string;
    /** Flip buttons (visible text = accessible name) */
    toBack: string;
    toFront: string;
    /** Under the QR code of the back */
    qrCaption: string;
    qrHint: string;
    /** Alternative text of the QR code (the link's accessible name) */
    qrAlt: string;
    /** Announced to screen readers when the download starts */
    started: string;
}

export interface ProjectLabels {
    demo: string;
    code: string;
    wipRibbon: string;
    wipBadge: string;
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

/** Texts of the badges and of the projects rail (Skills, LOT 4, S3) */
export interface SkillLabels {
    railTitle: string;
    /** Invites to point at a technology (shown while nothing is lit) */
    railHint: string;
    /** Before the projects of a badge (its description for screen readers too) */
    usedIn: string;
    noProject: string;
}

/** A Simple Icons logo, generated into src/data/generated/skillIcons.ts */
export interface SkillIcon {
    title: string;
    /** Brand colour, #rrggbb */
    hex: string;
    /** SVG path on a 24 × 24 box */
    path: string;
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
    /** Public profiles (the HoloCard back: its QR code is generated from this URL) */
    profiles: { linkedin: string };
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
        /** Rail of the projects and badge descriptions (S3) */
        labels: SkillLabels;
        /** Short lead above the groups (S1) */
        lead: string;
        /** Skills of the CV (F3), by group */
        groups: SkillGroup[];
        /** F4 projects linked to the skills by their tags (until LOT 5 merges them with projects.list) */
        projects: ProjectRef[];
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
