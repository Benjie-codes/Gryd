import React from "react";
import { motion } from "framer-motion";

const phases = [
    {
        label: "Now",
        title: "Building the foundation",
        subtitle: "Private development",
        description: "We’re currently building Gryd’s core: A style-first gradient engine. Expressive, layered gradient styles. Visual depth through blur, glow, and texture.",
        note: "This phase is about getting the fundamentals right."
    },
    {
        label: "Soon",
        title: "Early access",
        subtitle: "Invite-only release",
        description: "Early waitlist members will get: Access to initial gradient styles. A chance to explore and experiment. A direct line to influence what’s built next.",
        note: "This stage is about learning fast and refining quality."
    },
    {
        label: "Next",
        title: "Refinement & expansion",
        subtitle: "Polishing for real-world use",
        description: "Based on early feedback, we’ll focus on: Improving style quality and consistency. Making gradients easier to use in real projects. Expanding the style library with new visual directions.",
        note: "This phase turns exploration into reliability."
    },
    {
        label: "Launch",
        title: "Public release",
        subtitle: "Opening Gryd to everyone",
        description: "At launch, Gryd will offer: A curated set of expressive gradient styles. Production-ready outputs for modern interfaces. A clear bridge between design intent and implementation.",
        note: "Simple, focused, and ready to ship."
    },
    {
        label: "Beyond",
        title: "Continuous evolution",
        subtitle: "Growing with the community",
        description: "Post-launch, Gryd will continue to evolve with: New styles and experimental releases. Workflow improvements. Features shaped by real usage.",
        note: "Gradients don’t stand still — neither will Gryd."
    }
];

export default function Roadmap() {
    return (
        <section id="roadmap" className="relative py-32 px-4 bg-background overflow-hidden border-t border-white/5">
            {/* Background Ambience */}
            <div className="absolute left-[50%] top-0 w-1 bg-gradient-to-b from-transparent via-white/10 to-transparent h-full -translate-x-1/2 hidden md:block" />

            <div className="container mx-auto max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="font-mono text-primary tracking-[0.2em] text-sm uppercase mb-4 block">What's Coming</span>
                    <h2 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-white mb-6">
                        THE ROAD TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">GRYD</span>
                    </h2>
                    <p className="text-muted-foreground font-light text-lg max-w-xl mx-auto">
                        Gryd is launching in focused stages. Each phase builds toward a public release while involving early users in shaping the product.
                    </p>
                </motion.div>

                <div className="space-y-16">
                    {phases.map((phase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-center ${index % 2 === 1 ? "md:flex-row-reverse" : ""
                                }`}
                        >
                            {/* Timeline Node (Desktop) */}
                            <div className="absolute left-[50%] top-6 w-4 h-4 rounded-full bg-background border-2 border-primary -translate-x-1/2 z-20 hidden md:block shadow-[0_0_10px_var(--color-primary)]">
                                <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full" />
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 text-center md:text-left">
                                <span className={`inline-block px-3 py-1 rounded bg-secondary text-xs font-mono mb-4 text-primary border border-primary/20 ${index % 2 === 1 && "md:ml-auto md:mr-0"}`}>
                                    {phase.label}
                                </span>
                                <div className={`${index % 2 === 1 ? "md:text-right" : ""}`}>
                                    <h3 className="text-2xl font-bold font-display text-white mb-1 group-hover:text-primary transition-colors">
                                        {phase.title}
                                    </h3>
                                    <h4 className="text-lg text-primary/80 mb-4">{phase.subtitle}</h4>
                                    <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
                                        {phase.description.split(". ").map((sentence, i) => (
                                            <p key={i}>{sentence.trim()}{sentence.endsWith(".") ? "" : "."}</p>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-xs font-mono text-white/40 italic">
                                        // {phase.note}
                                    </p>
                                </div>
                            </div>

                            {/* Empty side for layout balance */}
                            <div className="hidden md:block w-1/2" />
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action for Waitlist */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 text-center bg-white/[0.02] border border-white/5 rounded-2xl p-8 md:p-12 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                    <h3 className="text-3xl font-display font-bold text-white mb-6 relative z-10">Join Early</h3>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto relative z-10">
                        The waitlist isn’t just about access. It’s about helping shape a better way to design gradients.
                    </p>
                    <p className="font-mono text-sm text-primary relative z-10">
                        If you care about how gradients feel, not just how they’re generated — now is the time to join.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
