import React from 'react';
import { IProject } from '@/core/types';
import { NeonButton } from '../atoms/NeonButton';

interface ProjectCardProps {
    data: IProject;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ data }) => {
    return (
        <div className="group relative w-full max-w-sm rounded-lg overflow-hidden bg-panel-bg shadow-[inset_0_4px_6px_rgba(0,0,0,0.3),inset_0_-4px_6px_rgba(0,0,0,0.3)] transition-transform hover:scale-105">
            {/* LED Border Effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neon-pink via-[#ff1c8e] to-[#ff0055] rounded-lg opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 animate-spin-slow"></div>

            <div className="relative p-6 flex flex-col items-center bg-gray-900 bg-opacity-90 h-full">
                {/* Poster Image with 3D Rotation */}
                <div className="w-full h-48 mb-4 perspective-1000">
                    {/* Fallback image if thumbnail is relative or missing, handle in real app. using data.thumbnailUrl */}
                    <img
                        src={data.thumbnailUrl}
                        alt={data.title}
                        className="w-full h-full object-contain animate-rotate-3d drop-shadow-2xl"
                    />
                    {/* Shadow under image */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-2 bg-black/30 blur-sm rounded-full"></div>
                </div>

                <h3 className="text-xl font-orbitron text-white mb-2">{data.title}</h3>

                {data.description && (
                    <p className="text-sm text-gray-300 text-center mb-4 font-montserrat">{data.description}</p>
                )}

                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {data.techStack.map((tech: string) => (
                        <span key={tech} className="text-xs text-neon-blue border border-neon-blue px-2 py-0.5 rounded-full shadow-[0_0_2px_#00bfff]">
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="mt-auto flex gap-4">
                    {data.projectUrl && <NeonButton label="Demo" href={data.projectUrl} variant="primary" />}
                    {data.repoUrl && <NeonButton label="Code" href={data.repoUrl} variant="secondary" />}
                </div>
            </div>
        </div>
    );
};
