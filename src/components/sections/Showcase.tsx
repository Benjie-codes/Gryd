import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const projects = [
    {
        title: "NEON FLUX",
        category: "Generative",
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        col: "md:col-span-3",
    },
    {
        title: "VOID EATER",
        category: "Atmospheric",
        img: "https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=2670&auto=format&fit=crop",
        col: "md:col-span-1",
    },
    {
        title: "LIQUID METAL",
        category: "Material",
        img: "https://images.unsplash.com/photo-1584384689201-e0bcbe2c7f1d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        col: "md:col-span-1",
    },
    {
        title: "CHROMATIC ABERRATION",
        category: "Experimental",
        img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
        col: "md:col-span-3",
    },
];

export default function Showcase() {
    return (
        <section id="preview" className="py-24 px-4 bg-background border-t border-white/5">
            <div className="container mx-auto">
                <div className="mb-10 flex relative">
                    <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter mb-4">
                        SELECTED <div className="text-primary italic">OUTPUTS</div>
                    </h2>
                    <p className="text-muted-foreground font-mono text-sm max-w-md absolute right-0 bottom-0">
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
