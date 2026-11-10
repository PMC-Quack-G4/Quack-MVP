# Universidad de los Andes — Ingeniería de Sistemas y Computación
## ISIS-2007: Diseño de Productos e Innovación en TI
### Semana 12: Tracción, Experimentación A/B y Landing Page — Nota Ejecutiva de Entrega
**Proyecto:** Quack — *«La primera IA a la que tú le enseñas»*  
**Equipo:** Grupo 4  

---

## 1. Propuesta de Valor y Modelo de Negocio en la Landing Page

### Propuesta de Valor Única (UVP)
> **«Quack: La primera IA a la que tú le enseñas.»**  
> Plataforma de estudio activo que erradica la ilusión de competencia (93.9% de prevalencia en estudiantes que usan LLMs de forma pasiva). El estudiante explica conceptos en voz alta a una IA en rol de alumna curiosa (**Método Feynman Oral**) y resuelve simulacros a mano bajo cronómetro con auditoría paso a paso (**Parcial a Ciegas OCR**).

### Amplitud Multidisciplinaria y Doble Modalidad (B2B vs. B2C)
Quack ofrece sus servicios mediante suscripción: planes individuales B2C y suscripciones institucionales B2B por estudiante activo. Feynman Oral, Parcial a Ciegas OCR y la analítica institucional se ofrecen dentro de esos planes, no como compras por examen.

1. **Rango amplio de materias (más allá de matemáticas)**: Programación, Algoritmia y Estructuras de Datos, Química, Biología, Biofísica, Física, Circuitos y Matemáticas Universitarias.
2. **Para Universidades e Instituciones (`Quack Campus` — \$12 USD Piloto / \$15 USD anual por estudiante)**:
   - **Cursos *Ready-to-Go* vía LTI (Bloque Neón / Canvas / Brightspace)**: El estudiante entra y ya ve todas sus materias matriculadas, unidades y temas evaluables montados y listos para practicar.
   - **Estadísticas Estratégicas de Éxito Estudiantil**: Panel analítico institucional que mide la evolución del dominio por cohorte, el incremento en tasas de aprobación (+25%), los cuellos de botella conceptuales por asignatura y alertas tempranas de retención (ROI > 50x al prevenir deserción de \$30M+ COP anuales).
3. **Para Estudiantes Individuales (`Quack Free` \$0 y `Quack Pro` \$19.900 COP/mes o \$149.000 COP/año)**:
   - El estudiante sube su propio material de estudio (apuntes, diapositivas, código, PDFs) y Quack adapta las sesiones Feynman y los simulacros a su contenido.

---

## 2. Llamados a la Acción (CTA) Principales

Siguiendo la metodología **StoryBrand** (Donald Miller) y el patrón de escaneo visual en **"Z"**:
- **CTA Superior Derecho (Header)**: `Probar ahora` + acceso directo a `Planes y Precios`.
- **CTA Primario en Hero**: `Ver planes y probar gratis` (ancla directa a `#precios`) acompañado de `Probar demo interactiva` (`/feynman`).
- **CTAs de Conversión Comercial en `#precios`**:
  - `Probar gratis ahora` (Plan Free \$0).
  - `Activar Quack Pro` (\$19.900 COP/mes o \$149.000 COP/año con checkout Nequi/PSE/Tarjeta).
  - `Solicitar Piloto Institucional` (Licencia Quack Campus B2B).

---

## 3. Sistema de Medición y Analítica Digital (Google Analytics 4 + UTM)

La landing page integra el módulo [`src/lib/analytics.ts`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/src/lib/analytics.ts) conectado a **Google Analytics 4** (`VITE_GA_MEASUREMENT_ID`) con captura automática de parámetros **UTM** (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`).

### a. Métrica Principal de Conversión (KPI Primario)
- **Tasa de Conversión a Intención de Compra / Práctica (`click_cta` y `begin_checkout`)**: Porcentaje de visitantes únicos que hacen clic en un botón de acción principal para iniciar su prueba o abrir el flujo de suscripción/piloto (`purchase` / `generate_lead`).

### b. Cuatro Métricas Secundarias de Comportamiento
1. **Profundidad de Scroll (`scroll_depth`)**: Eventos automáticos al alcanzar el `25%`, `50%`, `75%` y `90%` de la página para verificar que la longitud compacta evita la fatiga de navegación.
2. **Duración de Interacción Activa (`engagement_time` y `session_duration`)**: Registro a los 15s, 45s y al cierre de sesión para medir retención y lectura real.
3. **Embudo de Formularios (`form_start` $\rightarrow$ `generate_lead` / `purchase`)**: Tasa de finalización entre quienes inician el formulario de Checkout o del Lead Magnet (*Checklist Anti-Ilusión*) y quienes lo completan.
4. **Interacción con Demostraciones y Evidencia (`demo_interaction`, `testimonial_view`, `quack_easter_egg`)**: Clics en el selector multidisciplinario de Feynman (Algoritmos / Química-Biología / Física), en los pasos del Parcial OCR y en el sonido interactivo del patito Quack.

---

## 4. Diseño de Experimento A/B Testing

El experimento se encuentra implementado en vivo mediante [`src/hooks/useABVariant.ts`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/src/hooks/useABVariant.ts) y puede alternarse mediante parámetros URL (`?variant=A` vs. `?variant=B`) o desde el **Panel de Verificación Semana 12** en el pie de página.

| Componente de la Hipótesis | Definición para Quack |
| :--- | :--- |
| **Problema u Oportunidad Identificada** | Los estudiantes universitarios suelen postergar la adopción de herramientas de estudio hasta que sienten la urgencia económica y académica de perder una materia filtro (\$4.5M–\$6M COP). Queremos validar si un titular enfocado en **evitar la pérdida y el bloqueo inducido por la IA** convierte mejor que un titular **aspiracional de dominio**. |
| **Versión A — Control** | **Titular Aspiracional (Éxito):** *"Llega al parcial sabiendo que sabes."* + CTA: *"Ver planes y probar gratis"*. |
| **Versión B — Variación** | **Titular de Aversión al Riesgo (Stakes):** *"No dejes que la IA estudie por ti y te bloquee en el parcial."* + Eyebrow con costo de repetir materia (\$4.5M–\$6M COP) + CTA: *"Proteger mi semestre · Ver planes"*. |
| **Cambio Realizado** | Se modifica un único elemento principal arriba del pliegue (*above the fold*): el encuadre psicológico del titular y el verbo de acción del CTA primario en el Hero. |
| **Justificación (StoryBrand)** | Según Donald Miller (*Building a StoryBrand*) y la teoría de perspectivas de Kahneman & Tversky, la aversión a perder entre \$4.5M y \$6M COP y bloquearse frente al examen genera mayor urgencia de acción inmediata que una promesa puramente aspiracional. |
| **KPI Principal** | Tasa de clic en el CTA principal del Hero (`click_cta` con `location: "hero_primary"`) y tasa de inicio de checkout (`begin_checkout`). |
| **Métricas de Control** | • Tasa de rebote (*Bounce Rate*).<br/>• Porcentaje de scroll hasta la sección `#precios` (`scroll_depth >= 75%`).<br/>• Tiempo de permanencia en página (`session_duration >= 30s`) para asegurar que la urgencia no genere rechazo prematuro. |
| **Método de Validación Complementario (Bajo Tráfico)** | Además de la telemetría GA4, se ejecuta validación con pruebas de usabilidad cronometradas (Test de los 5 segundos / *Grunt Test*) con 10 estudiantes en salas de cómputo ML y W, más análisis de mapas de calor y grabaciones de sesión (Microsoft Clarity / Hotjar) para observar clics reales y descartar falsas affordances. |

---

## 5. Próximos 3 Pasos de Ejecución del Producto

1. **Despliegue de Piloto Institucional *Ready-to-Go* en un Curso Universitario**: Configurar un curso piloto (ej. *Algoritmos y Estructuras de Datos* o *Cálculo*) con sus unidades, sílabos y rúbricas precargadas, habilitando el reporte de **Estadísticas de Éxito Estudiantil** para la coordinación del curso.
2. **Validación de Conversión de Precios y Embudo A/B en Semana de Parciales**: Medir durante 14 días qué variante del Hero (`A` vs. `B`) logra mayor conversión hacia `Quack Pro` (\$19.900 COP/mes) y mayor descarga del *Checklist Anti-Ilusión de Competencia*.
3. **Prototipado de la Fase 0 — Memorización por Repetición Espaciada**: Diseñar e integrar la etapa previa de tarjetas de repetición espaciada (calificando la dificultad de recordar cada concepto) para articular el ciclo completo: **Memoriza (Tarjetas) $\rightarrow$ Explica (Feynman Oral) $\rightarrow$ Valida (Parcial a Ciegas OCR)**.
