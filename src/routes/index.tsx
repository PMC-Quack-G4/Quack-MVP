import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { FeynmanDemoPage } from "@/pages/FeynmanDemoPage";
import { ExamPage } from "@/pages/ExamPage";

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
        element: <FeynmanDemoPage />,
      },
      {
        path: "parcial-ciegas",
        element: <ExamPage />,
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
