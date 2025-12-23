import React, { useState } from "react";
import { ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Waitlist() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const { error } = await supabase
                .from('waitlist')
                .insert([{ email }]);

            if (error) throw error;

            setStatus("success");
            setEmail(""); // Clear input on success
        } catch (error: any) {
            console.error("Error submitting email:", error);
            setStatus("error");
            setErrorMessage(error.message || "Something went wrong. Please try again.");

            // Reset to idle after delay so they can try again
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return (
        <section id="waitlist" className="py-40 px-4 bg-background relative overflow-hidden border-t border-white/5">
            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none fade-mask"></div>

            <div className="container mx-auto relative z-10 max-w-2xl text-center">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 font-display">
                    JOIN THE <span className="text-primary">ALPHA</span>
                </h2>
                <p className="text-muted-foreground mb-12 text-lg">
                    Limited spots available for the Q1 2026 cohort. Secure your access identifier.
                </p>

                <form onSubmit={handleSubmit} className="relative group">
                    <div className="relative flex items-center bg-secondary/50 border border-white/10 rounded-full p-2 pl-6 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-300">
                        <input
                            type="email"
                            required
                            placeholder="enter@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status !== "idle"}
                            className="bg-transparent border-none outline-none flex-1 text-lg placeholder:text-muted-foreground/50 py-3"
                        />

                        <button
                            type="submit"
                            disabled={status !== "idle"}
                            className="bg-primary text-black hover:bg-white hover:text-black font-bold rounded-full p-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === "loading" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : status === "success" ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <ArrowRight className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {status === "success" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-12 left-0 right-0 text-primary font-mono text-sm"
                        >
                            :: ACCESS_REQUEST_LOGGED ::
                        </motion.div>
                    )}
                    {status === "error" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-12 left-0 right-0 text-red-500 font-mono text-sm flex items-center justify-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {errorMessage}
                        </motion.div>
                    )}
                </form>
            </div>
        </section>
    );
}
