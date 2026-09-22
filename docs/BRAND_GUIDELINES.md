# Guía de Identidad de Marca y Estilo — Quack MVP (BrandBook)

> Este documento extrae y consolida las directrices oficiales del **BrandBook de Quack** para garantizar que el diseño, los estilos y la interfaz del MVP reflejen la personalidad auténtica de la marca.

---

## 1. Visión y Concepto de Marca

- **Mascota y Símbolo**: Un patito de goma amarillo (*yellow rubber duck*) con pico marrón caramelo y ala naranja arena sobre fondos limpios.
- **Inspiración Pedagógica**: Alusión directa a la técnica de *Rubber Duck Debugging* (explicar el problema a un pato para descubrir el error uno mismo), llevada al aprendizaje activo STEM mediante el Método Feynman invertido.
- **Valores Nucleares**:
  - **Simplicity** (Simplicidad)
  - **Fun** (Diversión)
  - **Playfulness** (Espíritu lúdico)
- **Tono de Voz**:
  - *Cute* (Tierno, accesible)
  - *Playful* (Lúdico, no intimidante)
  - *Simple* (Directo, sin jerga innecesaria)
- **Estética Visual**:
  - *Playful Optimism* (Optimismo lúdico)
  - *Soft Geometry* (Geometría suave: bordes redondeados `rounded-xl`, `rounded-2xl`)
  - *Flat Vector Minimal* (Vectores planos y limpios)
  - *Approachable Warmth* (Calidez cercana y amigable)
  - *Friendly Simplicity* (Claridad visual y frescura)

---

## 2. Paleta de Colores Oficial

| Muestra | Nombre | HEX | RGB | HSL | CMYK | Rol en la Interfaz (UI) |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| ![#FFC800](https://via.placeholder.com/20/FFC800/000000?text=+) | **Amber Yellow** | `#FFC800` | `255, 200, 0` | `47°, 100%, 50%` | `0%, 22%, 100%, 0%` | **Color Primario**: Botones principales, elementos destacados, banners hero, acentos de marca. |
| ![#FFE978](https://via.placeholder.com/20/FFE978/000000?text=+) | **Dandelion Yellow** | `#FFE978` | `255, 233, 120` | `50°, 100%, 74%` | `0%, 9%, 53%, 0%` | **Color Secundario**: Fondos suaves de tarjetas, badges activos, highlights sutiles. |
| ![#D96B43](https://via.placeholder.com/20/D96B43/000000?text=+) | **Caramel Brown** | `#D96B43` | `217, 107, 67` | `16°, 66%, 56%` | `0%, 51%, 69%, 15%` | **Acento Pico**: Alertas de atención moderada, badges secundarios, contrastes cálidos. |
| ![#F89D4F](https://via.placeholder.com/20/F89D4F/000000?text=+) | **Sandy Orange** | `#F89D4F` | `248, 157, 79` | `28°, 92%, 64%` | `0%, 37%, 68%, 3%` | **Acento Ala**: Estados *hover*, interacción activa, botones secundarios cálidos. |
| ![#3B4151](https://via.placeholder.com/20/3B4151/000000?text=+) | **Gunmetal Gray** | `#3B4151` | `59, 65, 81` | `224°, 16%, 27%` | `27%, 20%, 0%, 68%` | **Texto & Neutro Principal**: Tipografía de títulos y cuerpo, bordes de alto contraste, modo oscuro. |

---

## 3. Tipografía Oficial

### Tipografía Principal de Marca: **Comfortaa**
- **Familia**: `'Comfortaa', cursive, sans-serif`.
- **Características**: Tipografía geométrica de terminaciones suaves y redondeadas que transmite accesibilidad, cercanía y diversión.
- **Uso**: 
  - Logotipo e isotipo.
  - Encabezados principales (`h1`, `h2`, `h3`).
  - Botones destacados de acción y marcas de llamada.

### Tipografía de Soporte & Rendimiento Técnico: **Inter**
- **Familia**: `'Inter', sans-serif`.
- **Uso**: Texto corrido, enunciados extensos de problemas matemáticos, notación algebraica y transcripciones de audio (para maximizar legibilidad técnica).

---

## 4. Normas de Uso del Logotipo (El Patito "Quack")

1. **Área de Protección (Clear Space)**:
   - Debe mantenerse un margen libre de al menos **50 px** en todos los lados del logo para evitar ruidos visuales o saturación con otros elementos.
2. **Tamaño Mínimo**:
   - Para no perder legibilidad del ojo y el pico:
     - En pantallas digitales: **Mínimo 128 px de ancho**.
     - En impresión física: **1.33 pulgadas de ancho**.
3. **Versiones de Contraste**:
   - Variante estándar: Sobre fondo claro (blanco o neutro suave).
   - Variante oscura: Ojo blanco/claro sobre fondo negro (`Gunmetal Gray`).

---

## 5. Dónde Guardar los Archivos del Pato en el Repositorio

Para que el pato y los recursos de marca estén organizados y accesibles en React y Vite, se definen dos ubicaciones estándar:

### 📁 Ubicación Oficial: `public/brand/`
```text
public/
└── brand/
    └── quack-logo.png        <-- Logo e isotipo original del patito (BrandBook oficial)
```
> **Ventajas de `public/brand/`**:
> - Se sirve de manera estática y directa en la raíz del servidor (`/brand/quack-logo.png`).
> - Se usa directamente en el `index.html` como favicon: `<link rel="icon" type="image/png" href="/brand/quack-logo.png" />`.
> - Se renderiza de forma limpia en cualquier componente React mediante `<img src="/brand/quack-logo.png" alt="Quack Logo" />`.

### 📁 Opción para Componentes Modulares: `src/assets/brand/`
Si deseas importarlo directamente como componente React o procesarlo con Vite:
```tsx
import QuackDuck from "@/assets/brand/quack-logo.svg?react";
```

---

## 6. Clases de Utilidad Tailwind Configuradas para la Marca

En `tailwind.config.js` y `src/index.css` se disponen las siguientes clases personalizadas:

- `bg-quack-amber` / `text-quack-amber`: `#FFC800`
- `bg-quack-dandelion` / `text-quack-dandelion`: `#FFE978`
- `bg-quack-caramel` / `text-quack-caramel`: `#D96B43`
- `bg-quack-sandy` / `text-quack-sandy`: `#F89D4F`
- `bg-quack-gunmetal` / `text-quack-gunmetal`: `#3B4151`
- `font-brand`: Fuente Comfortaa
