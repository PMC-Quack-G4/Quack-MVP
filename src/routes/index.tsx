import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Code-splitting de los módulos interactivos para que la landing page ("/")
// cargue en < 2 segundos sin descargar el SDK de Gemini ni los mocks pesados.
const LoginPage = React.lazy(() =>
  import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const CoursesPage = React.lazy(() =>
  import("@/pages/CoursesPage").then((m) => ({ default: m.CoursesPage }))
);
const CourseDetailPage = React.lazy(() =>
  import("@/pages/CourseDetailPage").then((m) => ({ default: m.CourseDetailPage }))
);
const FeynmanDemoPage = React.lazy(() =>
  import("@/pages/FeynmanDemoPage").then((m) => ({ default: m.FeynmanDemoPage }))
);
const ExamPage = React.lazy(() =>
  import("@/pages/ExamPage").then((m) => ({ default: m.ExamPage }))
);
const StatisticsPage = React.lazy(() =>
  import("@/pages/StatisticsPage").then((m) => ({ default: m.StatisticsPage }))
);

const RouteFallback: React.FC = () => (
  <div className="container py-16 text-center font-brand text-quack-gunmetal">
    Cargando módulo de Quack…
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
        path: "login",
        element: (
          <React.Suspense fallback={<RouteFallback />}>
            <LoginPage />
          </React.Suspense>
        ),
      },
      {
        path: "materias",
        element: (
          <RequireAuth>
            <React.Suspense fallback={<RouteFallback />}>
              <CoursesPage />
            </React.Suspense>
          </RequireAuth>
        ),
      },
      {
        path: "materias/:courseId",
        element: (
          <RequireAuth>
            <React.Suspense fallback={<RouteFallback />}>
              <CourseDetailPage />
            </React.Suspense>
          </RequireAuth>
        ),
      },
      {
        path: "feynman",
        element: (
          <RequireAuth>
            <React.Suspense fallback={<RouteFallback />}>
              <FeynmanDemoPage />
            </React.Suspense>
          </RequireAuth>
        ),
      },
      {
        path: "parcial-ciegas",
        element: (
          <RequireAuth>
            <React.Suspense fallback={<RouteFallback />}>
              <ExamPage />
            </React.Suspense>
          </RequireAuth>
        ),
      },
      {
        path: "estadisticas",
        element: (
          <RequireAuth>
            <React.Suspense fallback={<RouteFallback />}>
              <StatisticsPage />
            </React.Suspense>
          </RequireAuth>
        ),
      },
      {
        path: "dashboard",
        element: <Navigate to="/estadisticas" replace />,
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
