import { useEffect, useState } from 'react';
import { dataService } from '../../core/services/DataService';
import { IUserProfile, IProject, ITimelineStep } from '../../core/types';

export const DebugData = () => {
    const [profile, setProfile] = useState<IUserProfile | null>(null);
    const [projects, setProjects] = useState<IProject[]>([]);
    const [timeline, setTimeline] = useState<ITimelineStep[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [p, pr, t] = await Promise.all([
                    dataService.getProfile(),
                    dataService.getProjects(),
                    dataService.getTimeline(),
                ]);
                setProfile(p);
                setProjects(pr);
                setTimeline(t);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
        };
        loadData();
    }, []);

    if (error) return <div className="text-red-500 font-bold p-4">Error: {error}</div>;

    return (
        <div className="p-8 bg-gray-800 text-white font-mono text-xs overflow-auto h-screen">
            <h1 className="text-xl mb-4 text-green-400">DEBUG DATA VIEW</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <h2 className="text-lg text-blue-400 mb-2">Profile</h2>
                    <pre>{JSON.stringify(profile, null, 2)}</pre>
                </div>

                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <h2 className="text-lg text-purple-400 mb-2">Projects ({projects.length})</h2>
                    <pre>{JSON.stringify(projects, null, 2)}</pre>
                </div>

                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <h2 className="text-lg text-yellow-400 mb-2">Timeline ({timeline.length})</h2>
                    <pre>{JSON.stringify(timeline, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};
