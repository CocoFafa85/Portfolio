export interface IUserProfile {
    fullName: string;
    jobTitle: string;
    resumeUrl: string;
    socials: {
        linkedin?: string;
        github?: string;
        email?: string;
    };
    assets: {
        avatar: string;
        favicon: string;
    };
}

export interface ITimelineStep {
    id: string;
    title: string;
    description: string; // Supports HTML or Markdown
    imageUrl: string;
    order: number;
    activeLinks: string[]; // IDs of social links relevant to this step
}

export type ProjectStatus = 'completed' | 'in-progress' | 'archived';

export interface IProject {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl: string;
    status: ProjectStatus;
    projectUrl?: string;
    repoUrl?: string;
    techStack: string[];
}

export type SkillCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'tools';

export interface ISkill {
    id: string;
    name: string;
    category: SkillCategory;
    iconUrl?: string;
    proficiency?: number; // 0-100
}

export interface ITechWatch {
    topic: string;
    summary: string;
    detailsUrl?: string;
    methodology: {
        pull: string;
        push: string;
    };
}
