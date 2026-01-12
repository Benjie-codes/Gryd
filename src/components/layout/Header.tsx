import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "../../assets/brand/logo.png";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Why gryd?", href: "#why-gryd" }, // Mapping to Hero/About for now
        { name: "Preview", href: "#preview" },    // Mapping to Showcase
        { name: "What's coming", href: "#roadmap" }, // Mapping to Waitlist text area
    ];

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setMobileMenuOpen(false);
        }
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-4 bg-background/50 backdrop-blur-md border-b border-white/5" : "py-6 bg-transparent"
                    }`}
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-2 group">
                        <img src={logo} alt="GRYD Logo" className="h-8 w-auto object-contain transition-opacity duration-300 hover:opacity-80" />
                    </a>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => scrollToSection(e, link.href)}
                                className="font-mono text-xs uppercase tracking-[0.2em] text-white/60 hover:text-primary transition-colors duration-300 relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ))}
                    </nav>

                    {/* CTA & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        <a
                            href="#waitlist"
                            onClick={(e) => scrollToSection(e, "#waitlist")}
                            className="hidden md:flex items-center px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 font-mono text-xs tracking-widest uppercase font-bold"
                        >
                            Join Waitlist
                        </a>

                        <button
                            className="md:hidden text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-4 md:hidden flex flex-col items-center gap-8"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => scrollToSection(e, link.href)}
                                className="font-display text-2xl font-bold text-white hover:text-primary transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                        <a
                            href="#waitlist"
                            onClick={(e) => scrollToSection(e, "#waitlist")}
                            className="mt-4 px-8 py-3 rounded-full bg-primary text-black font-bold font-mono text-sm tracking-widest uppercase"
                        >
                            Join Waitlist
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
