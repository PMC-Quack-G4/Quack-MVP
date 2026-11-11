# Especificación de Producto y Modelo de Negocio — Quack

Este documento consolida los requerimientos funcionales, el perfil del usuario, la propuesta de valor, el alcance multidisciplinario y el modelo de suscripción B2C y B2B de **Quack**.

---

## 1. Perfil del Cliente y Problema Validado

- **Arquetipo Usuario (B2C / Usuario Final)**: **Camilo** (20 años), estudiante universitario de carreras de Ingeniería y Ciencias (Sistemas, Electrónica, Química, Biología, Industrial, Mecánica).
- **Arquetipo Comprador Institucional (B2B)**: **Decanaturas, Direcciones de Departamento y Coordinaciones Académicas** que buscan reducir tasas de reprobación (25%–35% en materias filtro) y mejorar la retención estudiantil.
- **Dolor Validado en Campo ($N = 33$ Descubrimiento + $N = 20$ Experimento YODA en UniAndes)**:
  - **Ilusión de Competencia (93.9%)**: Al estudiar leyendo pasivamente respuestas o código generado por IA (ChatGPT, Claude), el estudiante siente que domina el tema, pero al enfrentarse a la evaluación presencial sin ayuda experimenta bloqueos mentales.
  - **Consumo Pasivo sin Active Recall (75.8%)**: Solicitud de soluciones paso a paso terminadas sin esfuerzo de evocación propio.
  - **Costo Económico y Académico**: Reprobar una asignatura representa entre **\$4.500.000 y \$6.000.000 COP** en matrícula y retrasa el plan de estudios.

---

## 2. Propuesta de Valor Única (UVP) y Alcance Multidisciplinario

> **«Quack: La primera IA a la que tú le enseñas.»**  
> Erradica la ilusión de competencia convirtiendo el estudio pasivo en dominio autónomo comprobado, tanto en cursos precargados para universidades (*Ready-to-Go*) como adaptándose al material propio de cada estudiante.

### Cobertura Multidisciplinaria
Quack no es una herramienta exclusiva para matemáticas. Su motor socrático y de auditoría abarca:
1. **Programación, Algoritmia y Estructuras de Datos** (complejidad asintótica, árboles AVL, grafos, recursión, diseño de algoritmos).
2. **Química y Termodinámica** (equilibrio químico, cinética, energía libre de Gibbs, estequiometría).
3. **Biología y Biofísica** (fisiología celular, transporte activo de membrana, genética).
4. **Física y Electrónica** (mecánica, electromagnetismo, análisis de circuitos).
5. **Matemáticas Universitarias** (cálculo diferencial, integral, vectorial, álgebra lineal y ecuaciones diferenciales).

---

## 3. Modalidades del Producto: Institucional (B2B) vs. Individual (B2C)

### A. Quack Campus (Para Instituciones Educativas — B2B)
1. **Experiencia *Ready-to-Go* (Cero configuración para el alumno)**:
   - Integrado mediante LTI con el LMS de la universidad (Bloque Neón, Brightspace, Canvas).
   - Cuando el estudiante inicia sesión, **ya encuentra sus materias matriculadas, sílabos, unidades y temas que se evalúan montados y listos**, de modo que solo entra a poner a prueba su conocimiento con Quack.
2. **Estadísticas Estratégicas de Éxito Estudiantil**:
   - Entrega a la institución métricas agregadas sobre el impacto del uso de Quack en el éxito estudiantil: evolución del dominio por cohorte, incremento en tasas de aprobación (+25%), identificación de los conceptos exactos donde más se bloquean los estudiantes antes de cada parcial y alertas tempranas de retención.

### B. Quack Pro y Quack Free (Para Estudiantes Individuales — B2C)
- El estudiante individual que no entra por convenio institucional **sube su propio material de estudio** (diapositivas, apuntes en PDF, guías de laboratorio o código) y Quack se adapta dinámicamente a los temas de sus archivos.

---

## 4. Tabla de Suscripciones y Precios (Paso 16 Bill Aulet)

Quack monetiza sus servicios mediante suscripciones B2C y B2B. La suscripción institucional se factura por estudiante activo y año e incluye los servicios Campus; los flujos de práctica y evaluación forman parte de los planes y no se venden como compras individuales por examen.

| Plan / Servicio | Patrón | Precio (COP) | Precio (USD) | Incluye |
| :--- | :--- | :-: | :-: | :--- |
| **Quack Free** | Freemium | **\$0 COP** | **\$0.00 USD** | 3 sesiones Feynman/sem, 1 Parcial OCR/sem y carga de hasta 2 documentos/sem. |
| **Quack Pro Mensual** | Suscripción B2C | **\$19.900 COP/mes** | **\$4.99 USD/mes** | Carga ilimitada de material propio, Feynman y Parciales OCR ilimitados, reporte de brechas. |
| **Quack Pro Anual** | Suscripción B2C | **\$149.000 COP/año** | **\$37.50 USD/año** | Todo Quack Pro con **37% de ahorro** (equivale a ~\$12.400 COP/mes). |
| **Quack Campus Piloto** | Suscripción B2B | **\$48.000 COP/año** | **\$12.00 USD/año** | Por estudiante activo/año (20% dto. Early Adopter). Cursos *Ready-to-Go* + Estadísticas de Éxito Estudiantil. |
| **Quack Campus Estándar** | Suscripción B2B | **\$60.000 COP/año** | **\$15.00 USD/año** | Por estudiante activo/año. Integración LTI completa + Analítica Institucional de Éxito. |

---

## 5. Flujos Interactivos Implementados y Hoja de Ruta

### Flujo 0 (En Evaluación / Hoja de Ruta): Memorización por Repetición Espaciada
- *Estado*: **Veremos / Próximamente**.
- *Propósito*: Permitir que el estudiante entrene primero con tarjetas de memorización espaciada (calificando qué tan fácil o difícil fue recordar cada concepto) como calentamiento sinérgico antes de pasar a la explicación oral en Feynman y al Parcial a Ciegas.

### Flujo 1 (Implementado en `/feynman`): Modo Feynman Oral (IA Invertida)
- **Push-to-Talk fluido** (Web Speech API) + fallback de teclado accesible (`<SpeechFallbackInput />`).
- **Rol de "Alumna Curiosa"**: Quack formula contrapreguntas socráticas cortas y jamás entrega la respuesta.
- **Matriz de Subconceptos Clave**: Panel lateral que marca en tiempo real los subconceptos demostrados.

### Flujo 2 (Implementado en `/parcial-ciegas`): Parcial a Ciegas con Auditoría OCR
- **Fase de Enfoque con Cronómetro** a libro cerrado.
- **Carga de Evidencia Manuscrita** (`Drag & Drop`) + muestras predefinidas coherentes con las materias del usuario.
- **Auditoría Paso a Paso**: Clasificación de cada línea en `CORRECT`, `ALGEBRAIC_ERROR`, `CONCEPTUAL_ERROR` y `PROPAGATED_ERROR`, otorgando crédito parcial sobre 5.0.

### Flujo 3 (Implementado en `/login`, `/materias` y `/estadisticas`): Simulación Realista por Roles y Analítica
- **Acceso por Perfil (`/login`)**: El usuario ingresa su nombre personalizado y selecciona su rol (`Estudiante Campus`, `Estudiante Individual Pro` o `Profesor / Institución`). El prototipo personaliza toda la interfaz con ese nombre y restringe cada vista a su contexto real.
- **Hub de Materias (`/materias` y `/materias/:courseId`)**:
  - **Quack Campus (B2B)**: Materias oficiales precargadas vía LTI (*Ready-to-Go*); los módulos Feynman y OCR filtran sus temas estrictamente dentro de la materia elegida.
  - **Quack Pro Individual (B2C)**: Incluye carga interactiva de archivos (`PDF`, diapositivas, código o notas) para crear nuevas materias y extraer al instante subconceptos Feynman y simulacros OCR.
  - **Docente / Institución**: Muestra los cursos dictados y permite previsualizar temas o navegar al tablero de métricas.
- **Estadísticas Adaptativas por Rol (`/estadisticas`)**: Documentado en detalle en [`docs/ESTADISTICAS_POR_ROL.md`](./ESTADISTICAS_POR_ROL.md), cubriendo rendimiento personal estudiantil (con actualización en vivo al completar sesiones), analítica de cohorte e individual de estudiantes para **Docentes**, y estadísticas comparativas *Con Quack vs. Sin Quack* e impacto en retención para **Directivos**.
