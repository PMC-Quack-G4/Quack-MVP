import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileUp,
  GraduationCap,
  LogIn,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { playQuackSound } from "@/lib/quackSound";
import { cn } from "@/lib/utils";
import type { InstitutionScope, UserRole } from "@/types";

interface RoleOptionConfig {
  id: UserRole;
  title: string;
  badge: string;
  subtitle: string;
  highlights: string[];
  icon: React.ElementType;
  defaultNamePlaceholder: string;
  defaultEmailPlaceholder: string;
}

const ROLE_OPTIONS: RoleOptionConfig[] = [
  {
    id: "student_campus",
    title: "Estudiante · Quack Campus",
    badge: "B2B Institucional",
    subtitle: "Acceso LTI con tus materias ya matriculadas y listas para estudiar.",
    highlights: [
      "Cursos Ready-to-Go (Algoritmia, Cálculo, Álgebra, Física)",
      "Feynman Oral y Parcial OCR filtrados a tus materias",
      "Estadísticas de rendimiento personal",
    ],
    icon: GraduationCap,
    defaultNamePlaceholder: "Ej. Sofía Martínez",
    defaultEmailPlaceholder: "sofia.martinez@uniandes.edu.co",
  },
  {
    id: "student_individual",
    title: "Estudiante Individual · Quack Pro",
    badge: "B2C Personal",
    subtitle: "Sube tus apuntes, código o PDFs y crea tus propias materias.",
    highlights: [
      "Carga interactiva de archivos para generar temas y simulacros",
      "Solo ves y practicas las materias que tú subiste",
      "Estadísticas personales de dominio y errores",
    ],
    icon: FileUp,
    defaultNamePlaceholder: "Ej. Mateo Rojas",
    defaultEmailPlaceholder: "mateo.rojas@gmail.com",
  },
  {
    id: "institution",
    title: "Profesor / Institución",
    badge: "Docente + Directivo",
    subtitle: "Gestiona tus cursos dictados y analiza impacto estudiantil e institucional.",
    highlights: [
      "Vista Docente: cursos, cuellos de botella y alumnos (global e individual)",
      "Vista Directivo: impacto de Quack en aprobación y retención STEM",
      "Cambio instantáneo entre Docente y Directivo dentro de la sesión",
    ],
    icon: Building2,
    defaultNamePlaceholder: "Ej. Dra. Elena Vargas",
    defaultEmailPlaceholder: "elena.vargas@uniandes.edu.co",
  },
];

function parseInitialRole(param: string | null): UserRole {
  if (param === "student_campus" || param === "student_individual" || param === "institution") {
    return param;
  }
  return "student_campus";
}

function parseInitialScope(param: string | null): InstitutionScope {
  return param === "directivo" ? "directivo" : "docente";
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login } = useAuth();

  const redirectParam = searchParams.get("redirect");
  const [authTab, setAuthTab] = React.useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(
    parseInitialRole(searchParams.get("role"))
  );
  const [institutionScope, setInstitutionScope] = React.useState<InstitutionScope>(
    parseInitialScope(searchParams.get("scope"))
  );

  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [institutionName, setInstitutionName] = React.useState(
    user?.institutionName ?? "Universidad de los Andes"
  );
  const [password, setPassword] = React.useState("••••••••");
  const [formError, setFormError] = React.useState<string | null>(null);

  const activeConfig =
    ROLE_OPTIONS.find((item) => item.id === selectedRole) ?? ROLE_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setFormError("Ingresa tu nombre completo para personalizar tu experiencia en Quack.");
      return;
    }

    setFormError(null);
    playQuackSound("login_success");

    login({
      name: cleanName,
      email: email.trim() || activeConfig.defaultEmailPlaceholder,
      role: selectedRole,
      institutionName:
        selectedRole === "student_individual" ? undefined : institutionName.trim(),
      defaultInstitutionScope:
        selectedRole === "institution" ? institutionScope : "docente",
    });

    if (redirectParam && redirectParam.startsWith("/")) {
      navigate(redirectParam, { replace: true });
      return;
    }

    if (selectedRole === "institution" && institutionScope === "directivo") {
      navigate("/estadisticas?scope=directivo", { replace: true });
      return;
    }

    navigate("/materias", { replace: true });
  };

  const handleQuickDemoFill = (role: UserRole, presetName: string, scope?: InstitutionScope) => {
    setSelectedRole(role);
    setName(presetName);
    setFormError(null);
    if (scope) setInstitutionScope(scope);
    const config = ROLE_OPTIONS.find((r) => r.id === role);
    if (config) {
      setEmail(config.defaultEmailPlaceholder);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcf2] text-quack-gunmetal flex flex-col">
      {/* Header minimalista */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Link
            to="/"
            onClick={() => playQuackSound("login_logo")}
            className="flex items-center gap-2.5 group"
          >
            <img
              src="/brand/quack-logo.png"
              alt="Quack"
              className="size-9 object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-brand text-2xl font-bold tracking-tight text-quack-gunmetal">
              quack
            </span>
          </Link>

          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-600">
            <Link to="/">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a la Landing
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Columna izquierda: Selector de perfil realista */}
          <section className="lg:col-span-7 flex flex-col gap-6" aria-labelledby="role-selector-title">
            <div className="flex flex-col gap-2">
              <Badge className="w-fit bg-quack-dandelion text-quack-gunmetal border border-quack-amber/60 font-semibold">
                <Sparkles className="size-3.5 mr-1.5 text-quack-caramel" aria-hidden="true" />
                Prototipo Interactivo por Roles
              </Badge>
              <h1
                id="role-selector-title"
                className="font-brand text-3xl sm:text-4xl font-bold tracking-tight text-quack-gunmetal"
              >
                Simula el acceso real a <span className="underline decoration-quack-amber decoration-4 underline-offset-4">Quack</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Elige el tipo de usuario que deseas demostrar. Al ingresar tu nombre, toda la plataforma —sus materias,
                ejercicios Feynman/OCR y la pestaña de Estadísticas— se adaptará a tu rol.
              </p>
            </div>

            {/* Botones de autocompletado rápido para demos */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                Autocompletar demo:
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleQuickDemoFill("student_campus", "Sofía Martínez")}
                className="rounded-xl text-xs border-slate-200 hover:bg-quack-dandelion/40"
              >
                Sofía (Campus)
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleQuickDemoFill("student_individual", "Mateo Rojas")}
                className="rounded-xl text-xs border-slate-200 hover:bg-quack-dandelion/40"
              >
                Mateo (Individual Pro)
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleQuickDemoFill("institution", "Dra. Elena Vargas", "docente")}
                className="rounded-xl text-xs border-slate-200 hover:bg-quack-dandelion/40"
              >
                Dra. Elena (Docente + Directivo)
              </Button>
            </div>

            {/* 3 Tarjetas de Rol */}
            <div
              role="radiogroup"
              aria-label="Selecciona tu perfil de usuario"
              className="flex flex-col gap-3.5"
            >
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedRole === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setSelectedRole(option.id);
                      setFormError(null);
                    }}
                    className={cn(
                      "w-full text-left rounded-2xl border-2 p-5 transition-all bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quack-amber",
                      isSelected
                        ? "border-quack-amber bg-quack-dandelion/20 ring-2 ring-quack-amber/30"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex size-12 shrink-0 items-center justify-center rounded-xl border",
                          isSelected
                            ? "bg-quack-amber border-quack-gunmetal/20 text-quack-gunmetal"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        )}
                      >
                        <Icon className="size-6" aria-hidden="true" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-brand text-lg font-bold text-quack-gunmetal">
                            {option.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[11px] font-semibold",
                              isSelected
                                ? "bg-quack-gunmetal text-white"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {option.badge}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{option.subtitle}</p>
                        <ul className="mt-3 grid gap-1.5 sm:grid-cols-1">
                          {option.highlights.map((item) => (
                            <li
                              key={item}
                              className="flex items-center gap-2 text-xs font-medium text-slate-700"
                            >
                              <CheckCircle2
                                className={cn(
                                  "size-3.5 shrink-0",
                                  isSelected ? "text-quack-caramel" : "text-emerald-600"
                                )}
                                aria-hidden="true"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Columna derecha: Formulario de Login / Registro */}
          <section className="lg:col-span-5">
            <Card className="border-2 border-slate-200 bg-white rounded-3xl shadow-none overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div
                  role="tablist"
                  aria-label="Modo de acceso"
                  className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 mb-3"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authTab === "login"}
                    onClick={() => setAuthTab("login")}
                    className={cn(
                      "rounded-lg py-2 font-brand text-xs font-bold transition-colors",
                      authTab === "login"
                        ? "bg-white text-quack-gunmetal"
                        : "text-slate-600 hover:text-quack-gunmetal"
                    )}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authTab === "register"}
                    onClick={() => setAuthTab("register")}
                    className={cn(
                      "rounded-lg py-2 font-brand text-xs font-bold transition-colors",
                      authTab === "register"
                        ? "bg-white text-quack-gunmetal"
                        : "text-slate-600 hover:text-quack-gunmetal"
                    )}
                  >
                    Crear Cuenta Demo
                  </button>
                </div>

                <CardTitle className="font-brand text-2xl font-bold text-quack-gunmetal">
                  {authTab === "login" ? "Ingresa a tu espacio" : "Registra tu perfil"}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Perfil seleccionado:{" "}
                  <strong className="text-quack-gunmetal">{activeConfig.title}</strong>
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit} noValidate>
                <CardContent className="pt-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-name" className="text-xs font-bold text-quack-gunmetal">
                      Tu Nombre Completo *
                    </label>
                    <Input
                      id="login-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder={activeConfig.defaultNamePlaceholder}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-quack-amber"
                    />
                    <span className="text-[11px] text-slate-500">
                      Este nombre aparecerá en tu bienvenida y panel de la sesión.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-email" className="text-xs font-bold text-quack-gunmetal">
                      Correo {selectedRole === "student_individual" ? "personal" : "institucional"}
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeConfig.defaultEmailPlaceholder}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-quack-amber"
                    />
                  </div>

                  {selectedRole !== "student_individual" && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="login-institution" className="text-xs font-bold text-quack-gunmetal">
                        Institución Educativa (Convenio LTI)
                      </label>
                      <Input
                        id="login-institution"
                        type="text"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        placeholder="Universidad de los Andes"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-quack-amber"
                      />
                    </div>
                  )}

                  {selectedRole === "institution" && (
                    <div className="flex flex-col gap-1.5 rounded-2xl border border-amber-200 bg-quack-dandelion/20 p-3.5">
                      <span className="text-xs font-bold text-quack-gunmetal">
                        Vista inicial del panel institucional
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setInstitutionScope("docente")}
                          className={cn(
                            "rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
                            institutionScope === "docente"
                              ? "border-quack-gunmetal bg-quack-amber text-quack-gunmetal"
                              : "border-slate-200 bg-white text-slate-600"
                          )}
                        >
                          Docente (Mis Cursos)
                        </button>
                        <button
                          type="button"
                          onClick={() => setInstitutionScope("directivo")}
                          className={cn(
                            "rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
                            institutionScope === "directivo"
                              ? "border-quack-gunmetal bg-quack-amber text-quack-gunmetal"
                              : "border-slate-200 bg-white text-slate-600"
                          )}
                        >
                          Directivo (Impacto Campus)
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-600">
                        Dentro de la app podrás alternar libremente entre Docente y Directivo con 1 clic.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-password" className="text-xs font-bold text-quack-gunmetal">
                      Contraseña (Demo)
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-quack-amber"
                    />
                  </div>

                  {formError && (
                    <p
                      role="alert"
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                    >
                      {formError}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pb-7">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 rounded-xl bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-brand font-bold text-base shadow-none gap-2"
                  >
                    {authTab === "login" ? (
                      <LogIn className="size-4" aria-hidden="true" />
                    ) : (
                      <UserPlus className="size-4" aria-hidden="true" />
                    )}
                    {authTab === "login" ? "Entrar a Quack" : "Crear cuenta y comenzar"}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
                    Simulación local segura para demostraciones sin costo ni backend requerido.
                  </p>
                </CardFooter>
              </form>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};
