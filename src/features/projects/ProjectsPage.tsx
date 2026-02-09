import { useEffect, useState } from 'react';
import { ProjectCard } from '../../shared/components/molecules/ProjectCard';
import { dataService } from '../../core/services/DataService';
import { IProject } from '../../core/types';
import { NeonTitle } from '../../shared/components/atoms/NeonTitle';

export const ProjectsPage = () => {
    const [projects, setProjects] = useState<IProject[]>([]);

    useEffect(() => {
        dataService.getProjects().then(setProjects);
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen pt-12 pb-24">
            <NeonTitle text="ProjectS" className="mb-12" />

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4">
                {projects.map(project => (
                    <div key={project.id} className="flex justify-center">
                        <ProjectCard data={project} />
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
                <div className="text-gray-400 mt-12 animate-pulse">
                    Loading Mission Data...
                </div>
            )}
        </div>
    );
};
