# Quack-MVP 🦆

**Quack** es una plataforma de aprendizaje activo para disciplinas **STEM** fundamentada en el **Método Feynman Invertido** y **RAG Curricular**. Permite a los estudiantes explicar conceptos complejos mediante interacción por voz a un agente inteligente y validar su dominio autónomo a través de simulacros a mano alzada en papel, evaluados paso a paso mediante OCR y renderizado matemático formal.

---

## 🚀 Stack Tecnológico

El proyecto está construido bajo una arquitectura moderna, escalable y con tipado estricto:

| Tecnología | Versión | Rol en el Proyecto |
| :--- | :--- | :--- |
| **React** | `18.3.x` | Biblioteca de UI reactiva con modo estricto (`StrictMode`). |
| **Vite** | `6.x` | Bundler y servidor de desarrollo ultrarrápido con HMR. |
| **TypeScript** | `5.6.x` | Tipado estricto (`strict: true`, sin `any` implícitos ni variables no usadas). |
| **Tailwind CSS** | `3.4.x` | Framework de diseño utilitario para estilos responsivos. |
| **shadcn/ui** | Radix UI | Componentes accesibles, desacoplados y personalizables (`Button`, `Card`, `Badge`, `Input`). |
| **react-router-dom**| `6.28.x` | Enrutamiento del lado del cliente basado en `createBrowserRouter`. |
| **KaTeX** | `0.16.x` | Renderizado matemático de alto rendimiento para notación algebraica y cálculo. |
| **Lucide React** | `0.468.x` | Iconografía coherente y optimizada. |

---

## 📂 Estructura del Proyecto

```text
Quack-MVP/
├── .gitignore               # Configuración exhaustiva de exclusiones (Node, Vite, IDEs, OS)
├── components.json          # Configuración estándar para CLI de shadcn/ui
├── index.html               # Plantilla HTML principal con carga de tipografías
├── package.json             # Dependencias, metadatos y scripts npm/pnpm
├── postcss.config.js        # Configuración de PostCSS con Tailwind y Autoprefixer
├── tailwind.config.js       # Configuración de Tailwind extendida con variables CSS HSL
├── tsconfig.json            # Referencias maestras de TypeScript y path aliases
├── tsconfig.app.json        # Configuración estricta para código fuente (/src)
├── tsconfig.node.json       # Configuración estricta para herramientas Vite/Node
├── vite.config.ts           # Configuración de Vite con alias @ -> ./src
└── src/
    ├── App.tsx              # Componente raíz con RouterProvider
    ├── index.css            # Importación de KaTeX, Tailwind base y paleta shadcn/ui
    ├── main.tsx             # Punto de entrada de React 18 con createRoot
    ├── components/
    │   ├── common/
    │   │   └── MathRenderer.tsx   # Componente reutilizable para fórmulas KaTeX (inline y bloque)
    │   └── ui/
    │       ├── badge.tsx          # Componente Badge con variantes temáticas
    │       ├── button.tsx         # Componente Button con variantes Radix Slot
    │       ├── card.tsx           # Conjunto Card, CardHeader, CardTitle, etc.
    │       └── input.tsx          # Componente Input estilizado
    ├── layouts/
    │   └── RootLayout.tsx   # Layout general con cabecera de navegación y pie de página
    ├── lib/
    │   └── utils.ts         # Utilidad `cn(...)` para combinar clases de Tailwind de forma segura
    ├── mocks/
    │   └── quackData.ts     # Datos simulados con tipado estricto (fórmulas STEM y sesiones Feynman)
    ├── pages/
    │   ├── HomePage.tsx     # Vista principal con explorador interactivo KaTeX
    │   └── FeynmanDemoPage.tsx # Demostración de flujo Feynman, retroalimentación y OCR
    ├── routes/
    │   └── index.tsx        # Definición de rutas con react-router-dom v6
    └── types/
        └── index.ts         # Interfaces TypeScript para todo el dominio y estados
```

---

## ⚙️ Prerrequisitos

- **Node.js**: v18.0.0 o superior (recomendado v20+ o v24).
- **Gestor de Paquetes**: `npm` (incluido con Node.js) o `pnpm`.

---

## 🛠️ Guía de Instalación y Ejecución

El proyecto está preparado para funcionar de forma transparente y sin fricción tanto con **npm** (el estándar predeterminado de Node.js) como con **pnpm**.

### 1. Clonar el Repositorio
```bash
git clone https://github.com/usuario/Quack-MVP.git
cd Quack-MVP
```

### 2. Instalar Dependencias
Instala todas las dependencias del proyecto ejecutando:

```bash
npm install
```

> 💡 **Nota para usuarios de pnpm**: Si utilizas `pnpm`, también puedes ejecutar directamente:
> ```bash
> pnpm install
> ```

---

### 3. Servidor de Desarrollo
Inicia el servidor local de desarrollo con recarga rápida (HMR):

```bash
npm run dev
```
*(O con pnpm: `pnpm dev`)*.

La aplicación estará disponible inmediatamente en `http://localhost:3000`.

---

### 4. Verificación Estricta de Tipos (TypeScript)
Valida que todo el código cumpla con las reglas estrictas de TypeScript sin emitir archivos:

```bash
npm run typecheck
```
*(O con pnpm: `pnpm run typecheck`)*.

---

### 5. Compilación para Producción
Genera la versión optimizada y empaquetada para producción en el directorio `dist/`:

```bash
npm run build
```
*(O con pnpm: `pnpm run build`)*.

---

### 6. Vista Previa de Producción
Permite previsualizar localmente el resultado final compilado:

```bash
npm run preview
```
*(O con pnpm: `pnpm run preview`)*.

---

## 📐 Uso de Componentes Clave

### Renderizado Matemático con KaTeX (`MathRenderer`)
El componente `@/components/common/MathRenderer` permite desplegar expresiones algebraicas tanto en línea como en bloque:

```tsx
import { MathRenderer } from "@/components/common/MathRenderer";

// Renderizado en bloque (centrado)
<MathRenderer 
  math="\int_{a}^{b} f(x) \, dx = F(b) - F(a)" 
  block 
/>

// Renderizado en línea dentro de un párrafo
<p>
  La energía en reposo se define como <MathRenderer math="E = mc^2" /> según la relatividad.
</p>
```

### Componentes UI de shadcn
Para mantener consistencia de diseño, los componentes residen en `@/components/ui`:

```tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ExampleCard() {
  return (
    <Card>
      <CardHeader>
        <Badge variant="success">Aprobado</Badge>
        <CardTitle>Evaluación de Paso</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Continuar</Button>
      </CardContent>
    </Card>
  );
}
```

---

## 🔒 Estándares de Código y Buenas Prácticas

1. **Tipado Estricto**: Todo componente, hook, mock y función debe tener interfaces definidas en `@/types`. Se prohíbe el uso de `any`.
2. **Alias de Rutas**: Utilizar siempre `@/` para importar desde la carpeta `src/` (ej: `@/components/...`, `@/lib/utils`, `@/types`).
3. **Control de Versiones (`.gitignore`)**: Se excluyen automáticamente carpetas de dependencias (`node_modules`), artefactos de compilación (`dist`), logs, archivos de entorno locales (`.env*.local`), y archivos temporales del sistema operativo e IDEs.
