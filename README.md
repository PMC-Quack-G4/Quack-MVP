# Quack 🦆 — «La primera IA a la que tú le enseñas»

**Quack** es una plataforma EdTech de aprendizaje activo para estudiantes e instituciones de educación superior en áreas de **Programación, Algoritmia, Química, Biología, Física, Cálculo e Ingeniería**, diseñada para erradicar la **"ilusión de competencia"** (la falsa sensación de dominio producto del consumo pasivo de respuestas de LLMs convencionales).

---

## 🎯 Propuesta de Valor y Modalidades

### 1. Dos Pilares Activos + Hoja de Ruta Sinérgica
- **Método Feynman Oral (IA Invertida — `/feynman`)**: El estudiante asume el rol de docente y le explica el tema por voz a Quack ("alumna curiosa"). La IA formula preguntas socráticas, detecta saltos lógicos y jamás regala la respuesta.
- **Parcial a Ciegas OCR (Simulacro a Mano — `/parcial-ciegas`)**: El estudiante resuelve en papel a libro cerrado bajo cronómetro, sube una fotografía de su desarrollo y recibe una auditoría paso a paso con crédito parcial (`CORRECT`, `ALGEBRAIC_ERROR`, `CONCEPTUAL_ERROR`, `PROPAGATED_ERROR`).
- **En Hoja de Ruta (*Veremos / Próximamente*) — Memorización por Repetición Espaciada**: Fase previa con tarjetas adaptativas (calificando qué tan fácil o difícil fue recordar cada concepto) antes de validar con Feynman Oral y Parcial OCR.

### 2. Suscripciones Institucionales (B2B) e Individuales (B2C)
- **Para Universidades e Instituciones (`Quack Campus`)**:
  - **Cursos *Ready-to-Go* vía LTI (Bloque Neón, Canvas, Brightspace)**: Cuando el estudiante entra a Quack, ya ve todas sus materias matriculadas, unidades y temas que se evalúan listos para practicar sin configurar nada.
  - **Estadísticas Estratégicas de Éxito Estudiantil**: Panel de analítica institucional que entrega métricas de impacto del uso de Quack (incremento en tasas de aprobación, evolución de dominio por cohorte, cuellos de botella conceptuales por asignatura y alertas tempranas de retención).
- **Para Estudiantes Individuales (`Quack Pro` / `Quack Free`)**:
  - El estudiante sube su propio material de estudio (apuntes, diapositivas, código fuente o guías en PDF) y Quack adapta las sesiones a su contenido.

---

## 💰 Suscripciones y Precios (Paso 16 Bill Aulet)

Quack se ofrece mediante suscripciones para estudiantes e instituciones. La suscripción B2B se cobra por estudiante activo y año e incluye los servicios de Quack Campus; los flujos de práctica y evaluación forman parte de los planes, sin compras individuales por examen.

| Plan | Precio (COP) | Precio (USD) | Descripción |
| :--- | :-: | :-: | :--- |
| **Quack Free** | **\$0 COP** | **\$0.00 USD** | 3 sesiones Feynman/sem, 1 Parcial OCR/sem y hasta 2 documentos propios/sem. |
| **Quack Pro Mensual** | **\$19.900 COP/mes** | **\$4.99 USD/mes** | Carga ilimitada de material propio, Feynman y Parciales OCR ilimitados, reporte de brechas. |
| **Quack Pro Anual** | **\$149.000 COP/año** | **\$37.50 USD/año** | Todo Quack Pro ahorrando **37%** (~12.400 COP/mes). |
| **Quack Campus (B2B)** | **\$48.000 COP/año** | **\$12.00 USD/año** | Por estudiante/año en Piloto Early Adopter (\$60.000 COP / \$15 USD estándar). Cursos *Ready-to-Go* + Estadísticas de Éxito Estudiantil. |

---

## 🚀 Stack Tecnológico y Características de la Landing Page

- **React 18.3 + Vite 6 + TypeScript Estricto**: Carga ultrarrápida (`< 2s`) con code-splitting (`React.lazy`) para las rutas interactivas.
- **Tailwind CSS + shadcn/ui + KaTeX**: Estética fiel al BrandBook oficial (`Amber Yellow #FFC800`, `Dandelion #FFE978`, `Caramel #D96B43`, `Sandy #F89D4F`, `Gunmetal #3B4151`).
- **Easter Egg de Sonido ("¡Quack! 🦆")**: Al hacer clic en el logo del pato o en el modelo 3D se sintetiza en vivo el sonido característico del patito usando la Web Audio API (`src/lib/quackSound.ts`) sin archivos de audio pesados.
- **Analítica GA4 + UTM + Pruebas A/B (Semana 12 ISIS-2007)**:
  - Eventos de conversión (`page_view`, `click_cta`, `begin_checkout`, `generate_lead`, `purchase`, `scroll_depth`, `engagement_time`) en `src/lib/analytics.ts`.
  - Soporte de variantes A/B (`?variant=A` vs. `?variant=B`) y panel en vivo en el pie de página para inspección académica.

---

## ⚙️ Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Verificar tipos de TypeScript en modo estricto
npm run typecheck

# Compilar para producción
npm run build
```

---

## 📚 Documentación del Proyecto (`docs/`)

- [`docs/ENTREGA_SEMANA_12_LANDING_Y_TRACCION.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/ENTREGA_SEMANA_12_LANDING_Y_TRACCION.md): Documento ejecutivo con Propuesta de Valor, CTA, Métricas GA4, Hipótesis A/B y Próximos 3 Pasos.
- [`docs/PRODUCT_SPEC.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/PRODUCT_SPEC.md): Especificación funcional, alcance multidisciplinario y modelo de precios.
- [`docs/BRAND_GUIDELINES.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/BRAND_GUIDELINES.md): Manual de marca oficial.
- [`docs/ARCHITECTURE.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/ARCHITECTURE.md): Arquitectura técnica y adaptador dual (Gemini + Mock Fallback).
- [`docs/FEEDBACK_Y_HOJA_DE_RUTA.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/FEEDBACK_Y_HOJA_DE_RUTA.md): Evolución del producto hacia pilotos universitarios y nuevas funcionalidades.
