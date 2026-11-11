import * as React from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  Cpu,
  Database,
  FileCheck2,
  FileUp,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Mic,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { isGeminiActive, getActiveModel } from "@/lib/aiConfig";
import { playQuackSound } from "@/lib/quackSound";
import { cn } from "@/lib/utils";
import type { InstitutionScope, UserRole } from "@/types";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "QK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRoleShortLabel(role: UserRole, scope: InstitutionScope): string {
  if (role === "student_campus") return "Campus";
  if (role === "student_individual") return "Individual Pro";
  return scope === "directivo" ? "Directivo" : "Docente";
}

export const RootLayout: React.FC = () => {
  const isOnline = isGeminiActive();
  const activeModel = getActiveModel();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, institutionScope, switchRoleForDemo, logout } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const isBarePage = location.pathname === "/" || location.pathname === "/login";

  React.useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  React.useEffect(() => {
    if (!userMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [userMenuOpen]);

  // En Landing ("/") y Login ("/login") no se muestra la barra de la aplicación autentificada
  if (isBarePage) {
    return <Outlet />;
  }

  const navItems = [
    {
      to: "/materias",
      label: user?.role === "institution" ? "Mis Cursos" : "Mis Materias",
      icon: BookOpen,
    },
    {
      to: "/feynman",
      label: "Explícale a Quack",
      icon: Mic,
    },
    {
      to: "/parcial-ciegas",
      label: "Parcial a Ciegas",
      icon: FileCheck2,
    },
    {
      to: "/estadisticas",
      label: "Estadísticas",
      icon: BarChart3,
    },
  ] as const;

  const handleQuickRoleSwitch = (nextRole: UserRole, nextScope?: InstitutionScope) => {
    switchRoleForDemo(nextRole, nextScope);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    if (nextRole === "institution" && nextScope === "directivo") {
      navigate("/estadisticas?scope=directivo");
      return;
    }
    if (location.pathname.startsWith("/materias/")) {
      navigate("/materias");
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-5">
            <Link
              to={user ? "/materias" : "/"}
              onClick={() => playQuackSound("navbar_logo")}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <img
                src="/brand/quack-logo.png"
                alt=""
                className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
              />
              <span className="font-brand text-2xl font-bold tracking-tight text-quack-gunmetal leading-none">
                quack
              </span>
            </Link>

            <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1 text-sm font-medium">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 transition-colors whitespace-nowrap",
                        isActive
                          ? "bg-quack-dandelion/60 text-quack-gunmetal font-bold"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-quack-gunmetal"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 text-quack-caramel shrink-0" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Indicador de estado de IA */}
            {isOnline ? (
              <Badge
                variant="outline"
                className="hidden lg:flex items-center gap-1.5 border-emerald-400 bg-emerald-50 text-emerald-800 text-xs py-1 px-2.5 shadow-2xs font-medium"
                title={`Motor en línea: ${activeModel}`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                <span>Online</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="hidden lg:flex items-center gap-1.5 border-slate-300 bg-slate-50 text-slate-700 text-xs py-1 px-2.5 shadow-2xs font-medium"
                title="Modo Mock local activo (sin VITE_GEMINI_API_KEY en .env)"
              >
                <Database className="h-3.5 w-3.5 text-slate-500" />
                <span>Modo Mock</span>
              </Badge>
            )}

            {/* Pill del Usuario Autenticado + Menú rápido de roles para demostración */}
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-quack-amber font-brand text-xs font-bold text-quack-gunmetal">
                    {getInitials(user.name)}
                  </span>
                  <div className="hidden sm:flex flex-col leading-tight max-w-[160px]">
                    <span className="text-xs font-bold text-quack-gunmetal truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-quack-caramel truncate">
                      {getRoleShortLabel(user.role, institutionScope)}
                    </span>
                  </div>
                  <ChevronDown className="size-3.5 text-slate-400" aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 flex flex-col gap-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-quack-gunmetal truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-quack-dandelion/70 px-2 py-0.5 text-[10px] font-bold text-quack-gunmetal">
                        {user.planLabel}
                      </span>
                    </div>

                    <p className="px-3 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cambiar vista de demo (mismo nombre)
                    </p>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleQuickRoleSwitch("student_campus")}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left transition-colors",
                        user.role === "student_campus"
                          ? "bg-quack-dandelion/50 text-quack-gunmetal font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <GraduationCap className="size-4 text-quack-caramel shrink-0" aria-hidden="true" />
                      Estudiante · Quack Campus
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleQuickRoleSwitch("student_individual")}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left transition-colors",
                        user.role === "student_individual"
                          ? "bg-quack-dandelion/50 text-quack-gunmetal font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <FileUp className="size-4 text-quack-caramel shrink-0" aria-hidden="true" />
                      Estudiante · Individual Pro
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleQuickRoleSwitch("institution", "docente")}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left transition-colors",
                        user.role === "institution" && institutionScope === "docente"
                          ? "bg-quack-dandelion/50 text-quack-gunmetal font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <BookOpen className="size-4 text-quack-caramel shrink-0" aria-hidden="true" />
                      Profesor (Vista Docente)
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleQuickRoleSwitch("institution", "directivo")}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left transition-colors",
                        user.role === "institution" && institutionScope === "directivo"
                          ? "bg-quack-dandelion/50 text-quack-gunmetal font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Building2 className="size-4 text-quack-caramel shrink-0" aria-hidden="true" />
                      Directivo (Impacto Campus)
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <Link
                      to="/"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-quack-gunmetal"
                    >
                      <Home className="size-4 shrink-0" aria-hidden="true" />
                      Ver Landing Pública
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="size-4 shrink-0" aria-hidden="true" />
                      Cerrar sesión / Cambiar nombre
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Botón hamburguesa móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="flex md:hidden size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-quack-gunmetal"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Menú de navegación móvil */}
        {mobileMenuOpen && (
          <nav
            aria-label="Navegación móvil"
            className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                      isActive
                        ? "bg-quack-dandelion/60 text-quack-gunmetal font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    )
                  }
                >
                  <Icon className="size-4 text-quack-caramel" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        )}
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
