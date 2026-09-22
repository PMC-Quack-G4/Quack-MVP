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
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-8 py-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-md">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Método Feynman Invertido & RAG Curricular
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Aprende STEM explicando a una IA y validando con papel y OCR.
          </h1>
          <p className="text-base text-blue-100 sm:text-lg">
            Configuración inicial robusta de React 18 con Vite, TypeScript estricto, Tailwind CSS, componentes shadcn/ui, KaTeX y Lucide Icons.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md">
              <Link to="/feynman">
                Ver Simulación Feynman & OCR
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Code2 className="mr-2 h-4 w-4" />
              TypeScript Estricto
            </Button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
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
