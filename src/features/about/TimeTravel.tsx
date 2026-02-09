import { useEffect, useState } from 'react';
import { dataService } from '@/core/services/DataService';
import { ITimelineStep } from '@/core/types';
import { NeonTitle } from '@/shared/components/atoms/NeonTitle';
import { motion } from 'framer-motion';

export const TimeTravel = () => {
    const [timeline, setTimeline] = useState<ITimelineStep[]>([]);

    useEffect(() => {
        dataService.getTimeline().then(setTimeline);
    }, []);

    return (
        <div className="flex flex-col items-center py-12 px-4 gap-12">
            <NeonTitle text="Time Travel" />

            <div className="relative w-full max-w-4xl border-l-2 border-neon-blue/30 pl-8 md:pl-12 space-y-16">
                {timeline.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Dot on the timeline */}
                        <div className="absolute -left-[41px] md:-left-[57px] top-0 w-6 h-6 rounded-full bg-dark-bg border-4 border-neon-pink shadow-[0_0_10px_#ff379b]" />

                        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10 hover:border-neon-blue transition-colors group">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Image if available */}
                                {step.imageUrl && (
                                    <div className="w-full md:w-1/3 aspect-video rounded overflow-hidden">
                                        <img
                                            src={step.imageUrl}
                                            alt="Timeline event"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="text-xl font-orbitron text-neon-blue mb-2">{step.title}</h3>
                                    <div
                                        className="text-gray-300 font-montserrat prose prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: step.description }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
