import * as React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Code2, GraduationCap, FunctionSquare, Orbit, Calculator, Mic, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModuleData {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  feynmanModuleParam: string;
  examModuleParam: string;
  colorClass: string;
}

const modules: ModuleData[] = [
  {
    id: "algebra",
    title: "Álgebra Lineal",
    description: "Bases vectoriales, independencia lineal, transformaciones y espacios.",
    icon: Calculator,
    feynmanModuleParam: "algebra",
    examModuleParam: "algebra",
    colorClass: "text-blue-500",
  },
  {
    id: "calculo",
    title: "Cálculo Integral y EDOs",
    description: "Teorema fundamental, métodos de integración y ecuaciones diferenciales separables.",
    icon: FunctionSquare,
    feynmanModuleParam: "calculo",
    examModuleParam: "calculo",
    colorClass: "text-emerald-500",
  },
  {
    id: "fisica",
    title: "Física 1 (Mecánica)",
    description: "Leyes de Newton, conservación del momentum, colisiones y energía.",
    icon: Orbit,
    feynmanModuleParam: "fisica",
    examModuleParam: "fisica",
    colorClass: "text-amber-500",
  },
];

export const DashboardPage: React.FC = () => {
  return (
    <div className="container py-12 space-y-12 max-w-5xl">
      {/* Banner del Estudiante */}
      <section className="relative overflow-hidden rounded-3xl bg-quack-amber px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-white text-quack-gunmetal hover:bg-slate-50 border-0 font-bold text-xs px-3 py-1">
            <GraduationCap className="mr-2 h-4 w-4 text-quack-caramel" />
            Estudiante Activo
          </Badge>
          <h1 className="font-brand text-4xl font-bold tracking-tight text-quack-gunmetal">
            ¡Hola, Alejandro! 👋
          </h1>
          <p className="text-lg text-quack-gunmetal font-medium max-w-lg leading-relaxed">
            Vinculado a: <span className="font-bold underline decoration-quack-caramel decoration-4 underline-offset-4">Universidad de los Andes</span>
            <br />
            <br />
            Continúa erradicando la ilusión de competencia. Selecciona tu materia para empezar a practicar.
          </p>
        </div>
        
        {/* Decorative Duck (sin anidar tarjetas, flat design) */}
        <div className="hidden md:flex shrink-0">
          <img 
            src="/brand/quack-logo.png" 
            alt="Quack Rubber Duck" 
            className="h-40 w-40 object-contain" 
          />
        </div>
      </section>

      {/* Grid de Materias */}
      <section className="space-y-8">
        <h2 className="text-2xl font-brand font-bold tracking-tight text-quack-gunmetal flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-quack-caramel" />
          Tus Materias
        </h2>
        
        <div className="grid gap-8 md:grid-cols-3">
          {modules.map((mod) => (
            <Card key={mod.id} className="flex flex-col border border-slate-200 bg-white rounded-3xl shadow-none">
              <CardHeader className="p-8 pb-4">
                <div className={`mb-4 p-4 w-fit rounded-2xl bg-slate-50 border-2 border-slate-100 ${mod.colorClass}`}>
                  <mod.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold font-brand text-quack-gunmetal">{mod.title}</CardTitle>
                <CardDescription className="text-base mt-2 leading-relaxed text-slate-600">
                  {mod.description}
                </CardDescription>
              </CardHeader>
              
              <CardFooter className="mt-auto p-8 pt-4 flex flex-col gap-4">
                <Button asChild className="w-full bg-quack-amber text-quack-gunmetal hover:bg-quack-sandy font-bold rounded-xl shadow-none text-base py-6">
                  <Link to={`/feynman?module=${mod.feynmanModuleParam}`}>
                    <Mic className="mr-2 h-5 w-5" />
                    Modo Repaso
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent border-2 border-quack-amber text-quack-gunmetal hover:bg-quack-dandelion font-bold rounded-xl shadow-none text-base py-6">
                  <Link to={`/parcial-ciegas?module=${mod.examModuleParam}`}>
                    <FileCheck2 className="mr-2 h-5 w-5" />
                    Modo Examen
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

