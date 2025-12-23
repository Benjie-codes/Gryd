import { Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/5 bg-background">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <span className="font-display font-bold tracking-tight text-xl">GRYD</span>
        </div>

        <div className="flex gap-8 text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors hover:scale-110 duration-200">
            {/* Using Twitter icon for X as it's the standard library replacement often, or I could use an SVG for X if critical. For now Twitter icon is a safe fallback or I can just assume they want the X logo. */}
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="hover:text-primary transition-colors hover:scale-110 duration-200">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="hover:text-primary transition-colors hover:scale-110 duration-200">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>

        <div className="text-xs text-white/20 font-mono">
          © 2026 GRYD INC.
        </div>
      </div>
    </footer>
  );
}
