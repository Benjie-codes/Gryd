import React from "react";

export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/5 bg-background">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="font-display font-bold tracking-tight text-xl">GRYD</span>
        </div>
        
        <div className="flex gap-8 text-sm text-muted-foreground font-mono">
            <a href="#" className="hover:text-primary transition-colors">MANIFESTO</a>
            <a href="#" className="hover:text-primary transition-colors">DOCS</a>
            <a href="#" className="hover:text-primary transition-colors">TWITTER</a>
        </div>
        
        <div className="text-xs text-white/20 font-mono">
            © 2026 GRYD INC. // SYSTEM_ONLINE
        </div>
      </div>
    </footer>
  );
}
