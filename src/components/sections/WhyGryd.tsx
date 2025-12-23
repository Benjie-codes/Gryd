import React from "react";
import { motion } from "framer-motion";

const features = [
    {
        title: "Built for Designers",
        items: [
            "Explore bold gradient styles without fighting controls.",
            "Move faster from concept to polished visuals.",
            "Create gradients with mood, identity, and personality."
        ]
    },
    {
        title: "Built for Developers",
        items: [
            "Generate gradients that are production-ready and consistent.",
            "Reduce back-and-forth with design teams.",
            "Ship visually rich interfaces without heavy assets."
        ]
    },
    {
        title: "One Shared Visual Language",
        description: "Gryd bridges design and development — helping teams create gradients that look intentional, scale beautifully, and feel cohesive."
    }
];

export default function WhyGryd() {
    return (
        <section id="why-gryd" className="relative py-32 px-4 bg-background overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Header */}
                <div className="mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <div className="h-[1px] w-8 bg-primary"></div>
                        <span className="font-mono text-primary tracking-widest uppercase text-sm font-bold">Why Gryd</span>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white leading-[0.9]"
                        >
                            Gradients haven’t evolved. <span className="text-white/40">Design has.</span>
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed"
                        >
                            <p>
                                Gradients are everywhere in modern interfaces — yet most gradient tools are still stuck producing flat, predictable fades.
                            </p>
                            <p className="text-white font-medium">
                                They work, but they don’t inspire.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Problem vs Approach */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="p-8 border-l border-white/10 relative group"
                    >
                        <h3 className="text-2xl font-display font-bold text-white mb-4">The Problem</h3>
                        <p className="text-muted-foreground mb-4">
                            Traditional gradient generators treat gradients as utilities, not design elements.
                        </p>
                        <p className="text-sm font-mono text-white/60">
                            The result? Overused visuals, endless tweaking, and gradients that feel generated instead of designed.
                        </p>

                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="p-8 border-l border-primary relative group bg-white/[0.02]"
                    >
                        <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-primary via-primary/50 to-transparent shadow-[0_0_10px_var(--color-primary)]"></div>
                        <h3 className="text-2xl font-display font-bold text-white mb-4">The Gryd Approach</h3>
                        <p className="text-white/80 mb-6">
                            Gryd is a style-first gradient generator. Instead of sliders and technical parameters, Gryd focuses on:
                        </p>
                        <ul className="space-y-2">
                            {["Expressive, layered blends", "Depth, glow, and softness", "Gradients that feel intentional and modern"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-mono text-sm text-primary">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-6 text-sm italic text-white/60">
                            Gradients become visual assets — not afterthoughts.
                        </p>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-secondary/50 border border-white/5 p-8 rounded-lg hover:border-primary/30 transition-colors duration-300 group"
                        >
                            <h3 className="font-display font-bold text-xl text-white mb-6 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            {feature.items ? (
                                <ul className="space-y-4">
                                    {feature.items.map((item, i) => (
                                        <li key={i} className="text-sm text-muted-foreground font-light leading-normal">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                                    {feature.description}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Why Now */}
                <div className="text-center max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h3 className="font-mono text-primary text-sm tracking-[0.2em] mb-8 uppercase">Why Now?</h3>
                        <div className="space-y-2 text-2xl md:text-3xl font-display font-bold text-white mb-12">
                            <p>Interfaces are more expressive.</p>
                            <p className="text-white/60">Brands compete on feeling.</p>
                            <p className="text-white/40">Design systems demand depth without chaos.</p>
                        </div>
                        <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent">
                            <div className="px-8 py-4 bg-background rounded-full border border-white/10">
                                <p className="font-mono text-sm text-white">
                                    Gradients need better tools. <span className="text-primary font-bold">Gryd is building them.</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
