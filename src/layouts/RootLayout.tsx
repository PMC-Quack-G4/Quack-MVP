import * as React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Sparkles,
  Home,
  Mic,
  FileCheck2,
} from "lucide-react";

export const RootLayout: React.FC = () => {

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-quack-gunmetal">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-quack-dandelion p-1 border border-quack-amber transition-transform group-hover:scale-105">
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
                      ? "bg-quack-amber text-quack-gunmetal font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-quack-gunmetal"
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
                      ? "bg-quack-amber text-quack-gunmetal font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-quack-gunmetal"
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
                      ? "bg-quack-amber text-quack-gunmetal font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-quack-gunmetal"
                  }`
                }
              >
                <FileCheck2 className="h-4 w-4" />
                Módulo 2: Parcial a Ciegas OCR
              </NavLink>
            </nav>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-sm text-slate-600">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4 text-quack-caramel" />
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
