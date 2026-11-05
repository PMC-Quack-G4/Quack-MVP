import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";

// Code-splitting de los módulos interactivos para que la landing page ("/")
// cargue en < 2 segundos sin descargar el SDK de Gemini ni los mocks pesados.
const FeynmanDemoPage = React.lazy(() =>
  import("@/pages/FeynmanDemoPage").then((m) => ({ default: m.FeynmanDemoPage }))
);
const ExamPage = React.lazy(() =>
  import("@/pages/ExamPage").then((m) => ({ default: m.ExamPage }))
);

const RouteFallback: React.FC = () => (
  <div className="container py-16 text-center font-brand text-quack-gunmetal">
    Cargando módulo de práctica…
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "feynman",
        element: (
          <React.Suspense fallback={<RouteFallback />}>
            <FeynmanDemoPage />
          </React.Suspense>
        ),
      },
      {
        path: "parcial-ciegas",
        element: (
          <React.Suspense fallback={<RouteFallback />}>
            <ExamPage />
          </React.Suspense>
        ),
      },
      {
        path: "*",
        element: (
          <div className="container py-16 text-center space-y-4">
            <h1 className="text-3xl font-bold">404 - Página No Encontrada</h1>
            <p className="text-muted-foreground">La ruta solicitada no existe.</p>
          </div>
        ),
      },
    ],
  },
]);
