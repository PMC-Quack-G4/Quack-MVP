import * as React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Calculator,
  ScanLine,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const RootLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-primary">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-slate-900">Quack</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  STEM Feynman MVP
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900"
                  }`
                }
              >
                <Calculator className="h-4 w-4" />
                Explorador KaTeX
              </NavLink>

              <NavLink
                to="/feynman"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900"
                  }`
                }
              >
                <ScanLine className="h-4 w-4" />
                Simulacro Feynman & OCR
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  Demo
                </Badge>
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              React 18 + Vite + TS
            </Badge>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Docs</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-sm text-muted-foreground">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Quack MVP — Plataforma de aprendizaje activo para STEM</span>
          </div>
          <p className="text-xs text-slate-500">
            Radix UI • Tailwind CSS • KaTeX • react-router-dom • lucide-react
          </p>
        </div>
      </footer>
    </div>
  );
};
