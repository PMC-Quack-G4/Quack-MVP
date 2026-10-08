---
name: Quack MVP
description: Tu alumna curiosa para erradicar la ilusión de competencia STEM.
colors:
  primary: "#FFC800"
  secondary: "#D96B43"
  tertiary: "#F89D4F"
  neutral-bg: "#FFE978"
  neutral-text: "#3B4151"
typography:
  display:
    fontFamily: "Comfortaa, cursive, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  sm: "8px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
---

# Design System: Quack MVP

## Overview

**Creative North Star: "El Pato de Goma Interactivo"**

Quack MVP es un espacio de estudio STEM diseñado para aliviar la ansiedad matemática. Su estética combina el rigor académico (representado por KaTeX y fuentes precisas de texto) con una capa sumamente amigable y limpia (representada por colores cálidos, diseño plano y tipografías redondeadas). El objetivo es que los usuarios se sientan cómodos equivocándose mientras le explican conceptos complejos a la IA.

**Key Characteristics:**
- Lúdico, riguroso y estrictamente minimalista (Flat Design).
- Tonos cálidos sólidos (ámbares y naranjas) para reducir el estrés.
- Alta legibilidad tipográfica sin distracciones visuales ni ruido de fondo.

## Colors

La paleta evoca directamente a un pato de goma. Todo uso de color debe ser en bloque sólido (opacidad 100%).

### Primary
- **Quack Amber** (#FFC800): El color de marca principal, usado para acciones primarias y énfasis.

### Secondary
- **Caramel Beak** (#D96B43): Para contrastes cálidos y llamadas de atención.

### Tertiary
- **Sandy Wing** (#F89D4F): Para estados interactivos y acentos menores.

### Neutral
- **Gunmetal Gray** (#3B4151): Tipografía principal. Prohibido usar para fondos de tarjetas.
- **Dandelion Soft** (#FFE978): Fondos suaves de área amplia.

### Named Rules
**The Safe Space Rule.** Los errores en los ejercicios o auditorías OCR no deben sentirse punitivos. Evita rojos agresivos; usa fondos sólidos sutiles (ej. ámbar muy claro) para marcar correcciones sin estresar al usuario.

## Typography

**Display Font:** Comfortaa (cursive, sans-serif)
**Body Font:** Inter (sans-serif)

### Hierarchy
- **Display** (Bold): Logotipo y titulares de página principales.
- **Headline** (Semi-bold): Títulos de módulos y divisiones estructurales.
- **Body** (Regular): Lectura prolongada, interfaces de usuario y transcripciones.
- **Math**: KaTeX (Math-rendering específico, intocable por fuentes UI).

## Layout & Space (Anti-Slop Architecture)

El diseño se estructura mediante **espacio en blanco (Negative Space)**, no mediante cajas divisorias. 
Contenedores centrados con padding abundante. Uso frecuente de esquinas redondeadas exageradas (`rounded-2xl`, `rounded-3xl`) en elementos de bloque para reforzar la amabilidad.

### Named Rules
**The Single-Layer Rule (Anti-Card-ception).** Prohibido anidar tarjetas. Una tarjeta no puede contener otra tarjeta con fondo distinto o borde. La jerarquía interna debe lograrse únicamente mediante tamaños de tipografía y espaciado (margins/paddings).

## Elevation & Depth (Flat Design Strict)

**Cero sombras y cero transparencias.** El sistema rechaza el glassmorphism, los desenfoques (`backdrop-blur`) y las sombras de caída (`drop-shadow`, `shadow-sm`, `shadow-md`). 

### Named Rules
**The Grounded Duck Rule.** Los contenedores y tarjetas no flotan. Se anclan a la interfaz utilizando fondos de color sólido contrastante (ej. blanco puro sobre fondo claro) o un borde perimetral sólido ultra-fino (`border` de 1px usando tonos grises muy claros o ámbar lavado), sin relieve artificial.

## Shapes

Bordes redondeados en absolutamente todos los elementos interactivos y de contención (`rounded-lg` para inputs, `rounded-2xl` para tarjetas). Nada es puntiagudo o afilado.

## Components

### Buttons
- **Shape:** Ampliamente redondeados (`rounded-xl` o `full`).
- **Primary:** Fondo `Quack Amber` sólido sin gradientes. Texto `Gunmetal Gray`. Sin sombras.
- **Secondary:** Fondos transparentes con borde sólido `Quack Amber` de 2px.

### Cards / Containers
- **Background:** Blanco puro (`bg-white`) sólido 100%. Nunca opacidades relativas como `bg-white/90`.
- **Border/Shadow:** Prohibido `shadow`. Usar solo separación por fondo, o un borde sólido suave (`border border-slate-200`).

## Do's and Don'ts

### Do:
- **Do** estructurar la interfaz dejando que los elementos respiren con espacios grandes (`gap-6`, `p-8`).
- **Do** garantizar que las áreas de texto técnico usen fondo blanco y texto Gunmetal Gray puro.

### Don't:
- **Don't** aplicar sombras, gradientes o efectos translúcidos bajo ninguna circunstancia.
- **Don't** crear "cajas dentro de cajas" (UI enmarcada excesivamente). Si un elemento necesita destacarse dentro de una tarjeta, usa un leve cambio en el peso tipográfico o un ícono simple.