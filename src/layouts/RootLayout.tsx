import * as React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Sparkles,
  Home,
  Mic,
  FileCheck2,
  Cpu,
  Database,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isGeminiActive, subscribeToApiKeyChange } from "@/services/serviceFactory";
import { ApiKeyModal } from "@/components/common/ApiKeyModal";

export const RootLayout: React.FC = () => {
  const [hasGeminiApiKey, setHasGeminiApiKey] = React.useState<boolean>(isGeminiActive());
  const [isKeyModalOpen, setIsKeyModalOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Suscripción reactiva a cambios de API key
    const unsubscribe = subscribeToApiKeyChange(() => {
      setHasGeminiApiKey(isGeminiActive());
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-quack-dandelion/50 p-1 border border-quack-amber/40 shadow-sm transition-transform group-hover:scale-105">
                <img src="/brand/quack-logo.png" alt="Quack Logo" className="h-9 w-9 object-contain" />
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
            {/* Indicador interactivo y configurable de estado de IA */}
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(true)}
              className="flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-quack-amber rounded-full"
              title="Configurar motor de IA (Google Gemini)"
            >
              {hasGeminiApiKey ? (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 border-emerald-400 bg-emerald-50 text-emerald-800 text-xs py-1 px-2.5 cursor-pointer hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Gemini 2.0 Flash (IA Real)</span>
                  <Settings className="h-3 w-3 text-slate-400 ml-0.5" />
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 border-amber-300 bg-amber-50 text-amber-900 text-xs py-1 px-2.5 cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
                >
                  <Database className="h-3.5 w-3.5 text-quack-caramel" />
                  <span>Modo: Mock Local</span>
                  <span className="text-[10px] text-quack-caramel font-bold underline ml-1">
                    Conectar IA
                  </span>
                </Badge>
              )}
            </button>
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

      {/* Modal para configurar la API Key de Gemini */}
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </div>
  );
};
