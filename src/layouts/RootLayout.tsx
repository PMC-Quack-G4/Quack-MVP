import * as React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  Home,
  Mic,
  FileCheck2,
  Cpu,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const RootLayout: React.FC = () => {
  // Verificación dinámica de la API key de Gemini
  const hasGeminiApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-quack-dandelion/50 p-1 border border-quack-amber/40 shadow-sm transition-transform group-hover:scale-105">
                <img src="/brand/quack-logo.svg" alt="Quack Logo" className="h-9 w-9 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-brand text-2xl font-bold tracking-tight text-quack-gunmetal leading-none">
                  Quack
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider">
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
                <Home className="h-4 w-4" />
                Inicio
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
                <Mic className="h-4 w-4" />
                Módulo 1: Feynman Oral
              </NavLink>

              <NavLink
                to="/parcial-ciegas"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900"
                  }`
                }
              >
                <FileCheck2 className="h-4 w-4" />
                Módulo 2: Parcial a Ciegas OCR
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Indicador de estado de la Capa de Servicios */}
            {hasGeminiApiKey ? (
              <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-700 text-xs">
                <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                Modo: Gemini API (Free)
              </Badge>
            ) : (
              <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 border-sky-300 bg-sky-50 text-sky-700 text-xs">
                <Database className="h-3.5 w-3.5 text-sky-600" />
                Modo: Datos Simulados (Mock)
              </Badge>
            )}
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
            React 18 • Vite • TypeScript Estricto • Tailwind CSS • KaTeX • Radix UI
          </p>
        </div>
      </footer>
    </div>
  );
};
