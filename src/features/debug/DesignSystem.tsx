import { useState, useEffect } from 'react';
import { NeonTitle } from '../../shared/components/atoms/NeonTitle';
import { NeonButton } from '../../shared/components/atoms/NeonButton';
import { ProjectCard } from '../../shared/components/molecules/ProjectCard';
import { dataService } from '../../core/services/DataService';
import { IProject } from '../../core/types';

export const DesignSystem = () => {
    const [projects, setProjects] = useState<IProject[]>([]);

    useEffect(() => {
        dataService.getProjects().then(setProjects);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 p-8 flex flex-col gap-12 overflow-y-auto">
            <section className="text-center space-y-4">
                <h2 className="text-gray-500 mb-4 uppercase tracking-widest">Atoms</h2>
                <div className="p-8 border border-gray-700 rounded-lg flex flex-col items-center gap-8 bg-black/50">
                    <NeonTitle text="Neon Title" />
                    <div className="flex gap-4">
                        <NeonButton label="Primary Button" onClick={() => alert('Primary Clicked')} />
                        <NeonButton label="Secondary Button" variant="secondary" onClick={() => alert('Secondary Clicked')} />
                    </div>
                </div>
            </section>

            <section className="text-center space-y-4">
                <h2 className="text-gray-500 mb-4 uppercase tracking-widest">Molecules</h2>
                <div className="p-8 border border-gray-700 rounded-lg bg-black/50 flex flex-wrap justify-center gap-8">
                    {projects.length > 0 ? (
                        projects.map(p => <ProjectCard key={p.id} data={p} />)
                    ) : (
                        <p className="text-white">Loading projects...</p>
                    )}
                </div>
            </section>
        </div>
    );
};
