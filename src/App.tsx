import React, { useEffect } from "react";
import Header from "./components/layout/Header";
import Hero from "./components/sections/Hero";
import WhyGryd from "./components/sections/WhyGryd";
import Roadmap from "./components/sections/Roadmap";
import Showcase from "./components/sections/Showcase";
import Waitlist from "./components/sections/Waitlist";
import Footer from "./components/layout/Footer";
import { Analytics } from "@vercel/analytics/next"

function App() {
    // Smooth scroll behavior
    useEffect(() => {
        document.documentElement.style.scrollBehavior = "smooth";
        return () => {
            document.documentElement.style.scrollBehavior = "auto";
        };
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-body overflow-x-hidden selection:bg-primary selection:text-black">
            <Header />
            <main className="relative flex flex-col w-full">
                <Hero />
                <WhyGryd />
                <Showcase />
                <Roadmap />
                <Waitlist />
                <Analytics />
            </main>
            <Footer />
        </div>
    );
}

export default App;
