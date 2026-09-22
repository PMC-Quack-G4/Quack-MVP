import * as React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Code2,
  Atom,
  Sigma,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MathRenderer } from "@/components/common/MathRenderer";
import { mockFormulas } from "@/mocks/quackData";
import { FormulaDefinition } from "@/types";

export const HomePage: React.FC = () => {
  const [selectedFormula, setSelectedFormula] = React.useState<FormulaDefinition>(mockFormulas[0]);
  const [customLatex, setCustomLatex] = React.useState<string>(
    "\\int_{-\\infty}^{+\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}"
  );

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section con Identidad Quack */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-amber-400 to-orange-400 px-8 py-12 text-slate-900 shadow-xl border border-amber-300/60">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <Badge className="bg-white/80 text-quack-gunmetal hover:bg-white border-0 backdrop-blur-md font-semibold text-xs shadow-sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
              La primera IA a la que tú le enseñas
            </Badge>
            <h1 className="font-brand text-3xl font-bold tracking-tight sm:text-5xl text-quack-gunmetal leading-tight">
              Aprende STEM explicando a tu pato y validando a mano con OCR.
            </h1>
            <p className="text-base text-slate-800 font-medium sm:text-lg">
              Erradica la <span className="font-semibold underline decoration-orange-600 decoration-2">ilusión de competencia</span>. Practica con el Método Feynman Oral (Push-to-Talk) y audita tus exámenes a libro cerrado paso a paso.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-quack-gunmetal text-white hover:bg-slate-800 font-semibold shadow-md rounded-xl">
                <Link to="/feynman">
                  Practicar Feynman Oral
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-quack-gunmetal/30 bg-white/60 text-quack-gunmetal hover:bg-white rounded-xl">
                <Link to="/parcial-ciegas">
                  <Code2 className="mr-2 h-4 w-4" />
                  Simulacro a Ciegas (OCR)
                </Link>
              </Button>
            </div>
          </div>

          {/* Duck Mascot Presentation */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-amber-200 shadow-lg shrink-0">
            <img 
              src="/brand/quack-logo.png" 
              alt="Quack Rubber Duck Mascot" 
              className="h-36 w-36 object-contain drop-shadow-md animate-bounce [animation-duration:3s]" 
            />
            <span className="font-brand text-lg font-bold text-quack-gunmetal mt-2">
              Quack
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">
              Tu Alumna Curiosa
            </span>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
      </section>

      {/* Interactive KaTeX Playground */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Sigma className="h-6 w-6 text-primary" />
              Editor Interactivo de Fórmulas Matemáticas (KaTeX)
            </h2>
            <p className="text-sm text-muted-foreground">
              Renderizado instantáneo de notación algebraica y cálculo diferencial/integral.
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto">
            KaTeX v0.16
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input control card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Editor de Entrada LaTeX</CardTitle>
              <CardDescription>
                Modifica el código LaTeX para ver la actualización reactiva en vivo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="latex-input" className="text-xs font-semibold uppercase text-slate-500">
                  Expresión LaTeX
                </label>
                <Input
                  id="latex-input"
                  value={customLatex}
                  onChange={(e) => setCustomLatex(e.target.value)}
                  placeholder="Escribe fórmula LaTeX aquí..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Ejemplos rápidos:
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCustomLatex("\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{enc}")}
                  >
                    Ley de Ampère
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCustomLatex("i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\vec{r}, t) = \\hat{H}\\Psi(\\vec{r}, t)")}
                  >
                    Schrödinger
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCustomLatex("f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}")}
                  >
                    Definición Derivada
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KaTeX Preview card */}
          <Card className="flex flex-col justify-between border-primary/20 bg-primary/[0.02]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Renderizado en Bloque</CardTitle>
                <Badge variant="success">En Vivo</Badge>
              </div>
              <CardDescription>
                Resultado visual renderizado mediante <code className="font-mono text-xs">MathRenderer</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[140px] bg-white rounded-lg mx-6 border p-4 shadow-sm">
              <MathRenderer math={customLatex} block className="text-xl sm:text-2xl text-slate-800" />
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground flex justify-between border-t bg-slate-50/50 py-3">
              <span>Soporte MathML & HTML</span>
              <span className="font-mono">throwOnError: false</span>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* STEM Formulas Catalog */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Atom className="h-6 w-6 text-primary" />
            Catálogo Curricular Tipado
          </h2>
          <p className="text-sm text-muted-foreground">
            Mocks de datos estructurados con interfaces estrictas de TypeScript.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {mockFormulas.map((item) => (
            <Card
              key={item.id}
              className={`transition-all hover:shadow-md cursor-pointer ${
                selectedFormula.id === item.id ? "ring-2 ring-primary border-transparent" : ""
              }`}
              onClick={() => setSelectedFormula(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {item.subject.replace("-", " ")}
                  </Badge>
                  {selectedFormula.id === item.id && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <CardTitle className="text-base font-semibold mt-2">
                  {item.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-md bg-slate-50 p-3 border text-center">
                  <MathRenderer math={item.latex} block className="text-sm font-medium" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  {item.variables.length} variables definidas
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
