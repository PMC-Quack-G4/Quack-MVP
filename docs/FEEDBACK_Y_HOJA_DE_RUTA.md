# Hoja de Ruta Estratégica: de Quack MVP a Piloto Institucional y B2C

**Última actualización:** Noviembre 2026  
**Propósito:** Consolidar la evolución de Quack integrando el modelo de suscripción (B2B/B2C), la amplitud multidisciplinaria, las estadísticas de éxito estudiantil para universidades y la futura fase de memorización espaciada.

---

## 1. Visión Consolidada del Producto

Quack resuelve la **ilusión de competencia** combinando práctica activa por voz (**Feynman Oral**) y validación manuscrita bajo presión (**Parcial a Ciegas OCR**) en un rango amplio de materias: **Programación, Algoritmia, Química, Biología, Física y Matemáticas**.

### Diferenciación entre el Canal Institucional (B2B) y el Individual (B2C)

| Dimensión | Licencia Institucional (`Quack Campus` B2B) | Suscripción Individual (`Quack Pro` / `Free` B2C) |
| :--- | :--- | :--- |
| **Configuración de Materias** | **100% *Ready-to-Go***: Integrado vía LTI (Bloque Neón, Canvas, Brightspace). El estudiante entra y ya ve todas sus materias, sílabos y temas de evaluación montados. | **Adaptable al Usuario**: El estudiante sube su propio material de estudio (PDFs, diapositivas, código, apuntes) y Quack se adapta a lo que suba. |
| **Valor para la Institución** | **Estadísticas Estratégicas de Éxito Estudiantil**: Panel analítico con tasas de aprobación (+25%), dominio por cohorte, cuellos de botella conceptuales por materia y retención. | Informes individuales de *Brechas Erradicadas* y evolución personal antes de cada parcial. |
| **Suscripción** | **\$12 USD / alumno / año** en Piloto Early Adopter (\$48.000 COP); **\$15 USD / alumno / año** estándar (\$60.000 COP). La suscripción institucional cubre los servicios de Quack Campus. | **\$0 COP** (Free limitado) · **\$19.900 COP/mes** o **\$149.000 COP/año** (Quack Pro ilimitado). La suscripción individual da acceso a los servicios B2C según el plan. |

---

## 2. Evolución Funcional y Próximos Módulos

### 2.1. En Evaluación (*Veremos / Próximamente*): Memorización por Repetición Espaciada (Fase 0)
- **Objetivo**: No limitarse únicamente a evaluar, sino acompañar la fase previa de adquisición y consolidación de conceptos.
- **Sinergia del flujo completo**:
  1. **Fase 0 — Repetición Espaciada**: El estudiante practica con tarjetas interactivas y califica qué tan difícil o fácil fue recordar cada concepto o definición.
  2. **Fase 1 — Feynman Oral**: Una vez recordados los términos base, le explica el "por qué" y las conexiones causales a Quack por voz.
  3. **Fase 2 — Parcial a Ciegas OCR**: Aplica el conocimiento resolviendo un problema completo sin apuntes y bajo cronómetro.

### 2.2. Estadísticas de Éxito Estudiantil para Universidades
- Agregar vistas ejecutivas para decanaturas y coordinaciones de curso que correlacionen las sesiones activas en Quack con el desempeño en los cortes oficiales, preservando la privacidad individual del estudiante durante su práctica formativa.

### 2.3. Seguridad y Operación en Producción
- Migrar las llamadas de `@google/genai` detrás de un endpoint serverless para proteger la API key y administrar cuotas por plan (`Free`, `Pro`, `Campus`).
- Mantener siempre visible la distinción entre evaluaciones generadas por IA en línea y el modo demostrativo local.
