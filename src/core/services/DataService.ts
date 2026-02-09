import { IUserProfile, ITimelineStep, IProject, ISkill } from '../types';

class DataService {
    private static instance: DataService;
    private readonly BASE_PATH = '/data';

    private constructor() { }

    public static getInstance(): DataService {
        if (!DataService.instance) {
            DataService.instance = new DataService();
        }
        return DataService.instance;
    }

    private async fetchJson<T>(filename: string): Promise<T> {
        try {
            const response = await fetch(`${this.BASE_PATH}/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`DataService Error (${filename}):`, error);
            throw error;
        }
    }

    public async getProfile(): Promise<IUserProfile> {
        return this.fetchJson<IUserProfile>('profile.json');
    }

    public async getTimeline(): Promise<ITimelineStep[]> {
        return this.fetchJson<ITimelineStep[]>('timeline.json');
    }

    public async getProjects(): Promise<IProject[]> {
        return this.fetchJson<IProject[]>('projects.json');
    }

    public async getSkills(): Promise<ISkill[]> {
        // Currently placeholder as per Phase 2 definition
        return [];
        // return this.fetchJson<ISkill[]>('skills.json');
    }
}

export const dataService = DataService.getInstance();
