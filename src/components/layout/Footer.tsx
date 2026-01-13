import { Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/5 bg-background">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <span className="font-display font-bold tracking-tight text-xl">GRYD</span>
        </div>

        <div className="flex gap-8 text-muted-foreground">
          <a href="https://x.com/GrydHQ" className="hover:text-primary transition-colors hover:scale-110 duration-200">
            {/* X Logo */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
            </svg>
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
