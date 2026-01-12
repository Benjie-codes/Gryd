import React from "react";
import { motion } from "framer-motion";
import image1 from "../../assets/showcase/image1.png";
import image2 from "../../assets/showcase/image2.png";
import image3 from "../../assets/showcase/image3.png";
import image4 from "../../assets/showcase/image4.png";

const projects = [
    {
        title: "NOISE",
        category: "Generative",
        img: image1,
        col: "md:col-span-3",
    },
    {
        title: "HALFTONE",
        category: "Experimental",
        img: image2,
        col: "md:col-span-1",
    },
    {
        title: "METAL",
        category: "Material",
        img: image3,
        col: "md:col-span-1",
    },
    {
        title: "GAUSSIAN BLUR",
        category: "Atmospheric",
        img: image4,
        col: "md:col-span-3",
    },
];

export default function Showcase() {
    return (
        <section id="preview" className="py-24 px-4 bg-background border-t border-white/5">
            <div className="container mx-auto">
                <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                    <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
                        SELECTED <span className="text-primary italic block md:inline">OUTPUTS</span>
                    </h2>
                    <p className="text-muted-foreground font-mono text-sm max-w-md">
                        Curated generated assets rendered in real-time. High-fidelity textures for next-gen interfaces.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[300px]">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className={`group relative overflow-hidden rounded bg-secondary border border-white/5 ${project.col}`}
                        >
                            {/* Image */}
                            <img
                                src={project.img}
                                alt={project.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="font-mono text-xs text-primary mb-2 block tracking-wider uppercase border border-primary/20 bg-primary/10 w-fit px-2 py-1 rounded-sm">
                                            {project.category}
                                        </span>
                                        <h3 className="text-xl font-bold tracking-tight text-white group-hover: transition-colors duration-300">
                                            {project.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
