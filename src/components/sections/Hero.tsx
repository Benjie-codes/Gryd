import React, { useRef } from "react";
import { Particles } from "@/components/ui/particles";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section
            ref={containerRef}
            className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background"
        >
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <Particles
                    className="absolute inset-0 h-full w-full"
                    quantity={300}
                    staticity={30}
                    ease={70}
                    size={0.8}
                    color="#ccff33" // Acid Green
                    vx={0.2}
                    vy={0.2}
                    refresh
                />
                {/* Subtle Noise Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>

                {/* Vignette */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-background/50 to-background pointer-events-none"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container flex flex-col items-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-6 relative"
                >
                    <span className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></span>
                    <h1 className="text-[15vw] leading-[0.85] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 select-none mix-blend-difference font-display">
                        GRYD
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-lg md:text-2xl text-muted-foreground font-light max-w-xl mx-auto tracking-wide"
                >
                    The gradient engine for the <span className="text-primary font-medium">post-flat</span> era.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-24"
                >
                    <ArrowDown className="w-6 h-6 text-white/50 animate-bounce" />
                </motion.div>
            </div>
        </section>
    );
}
