# Especificación Funcional y de Diseño: Pestaña **Estadísticas** por Rol (`/estadisticas`)

> Documento oficial de arquitectura funcional y experiencia de usuario para el módulo de analítica de **Quack**, adaptado dinámicamente según el perfil autenticado en [`AuthContext`](../src/context/AuthContext.tsx).

---

## 1. Propósito del Módulo y Flujo Realista por Roles

El objetivo de la pestaña **Estadísticas** es transformar cada interacción en **Explícale a Quack** (Feynman Oral) y **Parcial a Ciegas OCR** en métricas accionables para el actor correcto, erradicando la **ilusión de competencia** tanto a escala personal (estudiante) como grupal e institucional (docente y directivo).

### Reglas Transversales de Acceso y Aislamiento
1. **Autenticación Obligatoria de Demo (`/login`)**: Ninguna vista interna (`/materias`, `/materias/:courseId`, `/feynman`, `/parcial-ciegas`, `/estadisticas`) es accesible sin sesión activa (`RequireAuth`). Al iniciar sesión o registrarse, toda la aplicación muestra el **nombre exacto ingresado por el usuario** y persiste la sesión en `localStorage` (`quack_mvp_auth_session_v1`).
2. **Aislamiento de Contexto por Rol**:
   - **Estudiante Quack Campus (`student_campus`)**: solo visualiza materias precargadas vía LTI (*Ready-to-Go*) y estadísticas personales derivadas de su práctica en esas materias.
   - **Estudiante Individual (`student_individual`)**: solo visualiza las materias creadas desde el material que él mismo cargó (`MaterialUploadModal`) y sus estadísticas personales reales.
   - **Usuario Institución (`institution`)**: posee una **perspectiva dual** (`Docente ↔ Directivo`) conmutando sin cerrar sesión entre el seguimiento de sus cursos/estudiantes y la analítica estratégica de impacto institucional.

---

## 2. Comportamiento Detallado por Rol

### 2.1. Rol Estudiante — **Quack Campus** (`student_campus`) y **Quack Pro Individual** (`student_individual`)
*Componente principal:* [`StudentStatsView`](../src/components/analytics/StudentStatsView.tsx)

Ambos perfiles estudiantiles comparten una vista enfocada exclusivamente en **rendimiento personal** (sin exposición de analítica de terceros ni de otros cursos no matriculados/subidos):

| Bloque UI | Qué muestra | Origen y Actualización |
| :--- | :--- | :--- |
| **Encabezado Personalizado** | Saludo con `user.name`, plan activo (`Quack Campus` o `Quack Pro`) e institución (solo Campus). Acceso rápido a `/materias`. | `AuthContext.user` |
| **4 KPIs Principales** | 1. **Dominio Global (%)**: promedio ponderado de los temas de sus materias.<br>2. **Promedio Parcial OCR (`/ 5.0`)**: nota media obtenida en simulacros escritos.<br>3. **Práctica Activa**: número de sesiones + minutos totales sin ayudas externas.<br>4. **Racha & Subconceptos**: días consecutivos y subconceptos explicados a Quack. | Recalculados en vivo por `getStudentPersonalStats()` tras cada sesión completada en `/feynman` o `/parcial-ciegas`. |
| **Gráfica Dual de Evolución** | Comparativa semanal entre **Dominio Feynman Oral (%)** (comprensión verbal) y **Nota Parcial OCR (%)** (rigor en papel a libro cerrado) mediante [`DualTrendChart`](../src/components/analytics/Charts.tsx). Permite detectar brechas ("cree entender al hablar, pero falla en papel"). | Serie histórica base + cada nueva sesión guardada por `recordPracticeAttempt()`. |
| **Radiografía de Errores en Papel** | Gráfico de dona [`ErrorDonutBreakdown`](../src/components/analytics/Charts.tsx) clasificando pasos OCR auditados en:<br>• `CORRECT` (Pasos Correctos)<br>• `CONCEPTUAL_ERROR` (Prioridad Feynman)<br>• `ALGEBRAIC_ERROR` (Signos/despeje)<br>• `PROPAGATED_ERROR` (Error arrastrado con crédito parcial) | Suma acumulada de `errorCounts` de cada `PracticeAttempt` en modo `"ocr"`. |
| **Siguiente Paso Recomendado** | Tarjeta inteligente con enlace directo a la práctica que más impacto tendrá: identifica el tema de menor dominio actual; si es `< 60%` sugiere **Feynman Oral**, y si es `>= 60%` sugiere validar en **Parcial OCR**. | Calculado dinámicamente sobre `courses` del usuario. |
| **Dominio por Materia y Tema** | Barras de progreso por asignatura matriculada (Campus) o generada por archivo propio (Pro). | Refleja al instante la subida de nuevo material y los avances logrados en cada tema. |
| **Historial Reciente** | Bitácora cronológica inversa de las últimas 5 sesiones (modo, materia, tema, fecha y puntaje). | `practiceHistory` |

> **Diferencia clave B2B vs B2C:** En `student_campus`, el progreso se limita a las asignaturas institucionales (ej. *ISIS-1226*, *MATE-1214*, *MATE-1105*, *FISI-1018*). En `student_individual`, el cálculo considera **únicamente** las materias generadas por los archivos subidos por el estudiante (ej. PDFs, presentaciones o código en Python).

---

### 2.2. Rol Institución · **Vista Docente** (`role: "institution"`, `institutionScope: "docente"`)
*Componente principal:* [`DocenteStatsView`](../src/components/analytics/DocenteStatsView.tsx)

Diseñada para que el profesor gestione las materias que dicta, identifique qué conceptos frenan a su grupo antes de un examen y pueda intervenir individualmente:

1. **Selector de Materias Dictadas**: Pestañas por cada curso asignado al docente (`ISIS-1226 Estructuras de Datos`, `MATE-1214 Cálculo Integral`, `FISI-1018 Física 1`), con conteo de matriculados.
2. **Exportación de Reporte CSV**: Botón `"Exportar CSV"` que descarga un archivo tabular real (`quack_docente_<CODIGO>.csv`) con las métricas de sus estudiantes y confirma la descarga con un banner accesible (`role="status"`).
3. **4 KPIs del Curso**:
   - **Participación Semanal**: estudiantes activos / matriculados y `%` de participación autónoma.
   - **Dominio Feynman Cohorte (`%`)**: promedio de explicación socrática de la sección.
   - **Promedio Parcial OCR (`/ 5.0`)**: calificación promedio obtenida a libro cerrado.
   - **Alertas Tempranas**: conteo de estudiantes con riesgo académico alto.
4. **Analítica Visual del Grupo**:
   - **Evolución del Curso (`Sem 1 – Sem 5`)**: progreso de cohorte en Feynman vs. Parcial OCR (`DualTrendChart`).
   - **Taxonomía Agregada de Errores**: distribución porcentual de pasos correctos vs. errores conceptuales, algebraicos y de arrastre de toda la sección (`ErrorDonutBreakdown`).
5. **Mapa de Cuellos de Botella por Subconcepto (Agenda de Clase)**:
   - Tarjetas priorizadas que exponen el subconcepto exacto de bloqueo (ej. *"Factorización en producto g(x)·h(y)"* en EDOs o *"Rotación doble LR vs. simple LL"* en AVL), `%` y número de estudiantes bloqueados, tipo de fallo dominante y **acción pedagógica recomendada para abrir la próxima clase**.
6. **Tabla Global e Inspección Individual de Estudiantes**:
   - Búsqueda instantánea por nombre o código + filtros por estado (`Todos`, `En Riesgo`, `En Observación`, `Óptimo`).
   - Al pulsar **"Inspeccionar"** sobre cualquier estudiante se abre un **Modal de Detalle Individual** (`role="dialog"`, cierre con `Esc`) con:
     - Métricas individuales (`Feynman %`, `Parcial OCR /5`, sesiones y minutos).
     - Desglose tema por tema incluyendo el `bottleneckSubtopic` exacto detectado.
     - Últimas sesiones con diagnóstico de Quack (ej. *"Falló 3 intentos en factorización"* o *"Error de signo en sistema A y B con arrastre"*).
     - Intervención recomendada y acción simulada **"Asignar refuerzo socrático vía LTI"**.

---

### 2.3. Rol Institución · **Vista Directivo** (`role: "institution"`, `institutionScope: "directivo"`)
*Componente principal:* [`DirectivoStatsView`](../src/components/analytics/DirectivoStatsView.tsx)

Orientada a decanos, directores de programa y vicerrectorías académicas para evaluar el retorno pedagógico e institucional de **Quack Campus**:

1. **Filtro por Facultad / Departamento**: segmentación en vivo entre `Todas`, `Ingeniería de Sistemas`, `Matemáticas`, `Física` y `Química y Biología`, junto con botón **"Exportar Resumen Ejecutivo (.csv)"**.
2. **4 Hero KPIs de Impacto Institucional**:
   - **Tasa de Aprobación STEM**: `86.4%` (`+23.2 pts` frente al `63.2%` histórico sin Quack).
   - **Retención Primer Año**: `92.1%` (`+14.5 pts` en materias filtro STEM).
   - **Adopción Licencia Campus**: `1,840 / 2,000` asientos activos (`92%` de uso vía Bloque Neón LTI).
   - **Reducción Ilusión de Competencia**: `-61%` en la brecha entre autopercepción de dominio y nota real obtenida en examen escrito.
3. **Trayectoria Longitudinal (Con Quack vs. Grupo Control Sin Quack)**:
   - Gráfica interactiva (`DualTrendChart`) desde **Sem 1** hasta **Pre-Final** marcando los hitos oficiales (`Parcial 1`, `Parcial 2`, `Pre-Final`), contrastando la línea sólida `#FFC800` (*Cohorte con Quack*) contra la línea punteada gris (*Cohorte control sin Quack*).
4. **Correlación por Intensidad de Uso**:
   - Evidencia cuantitativa del efecto dosis-respuesta:
     - *0 sesiones/sem (Control)*: `63.2%` aprobación (`3.1 / 5.0`).
     - *1–2 sesiones/sem (Moderado)*: `81.5%` aprobación (`3.8 / 5.0`).
     - *3+ sesiones/sem (Constante)*: `93.4%` aprobación (`4.4 / 5.0`).
5. **Impacto Comparativo por Asignatura y Facultad**:
   - Barras pareadas (*Sin Quack* vs. *Con Quack*) por asignatura (`MATE-1214`, `ISIS-1226`, `FISI-1018`, `QUIM-1103`) con ganancia en puntos de aprobación y porcentaje de reducción de ilusión de competencia.
6. **Radar Pre-Parcial (48h–72h)**:
   - Alertas tempranas institucionales sobre evaluaciones próximas en el LMS (ej. `Parcial 2 en 48h` con `44%` / `273` estudiantes bloqueados en EDOs separables) y botón **"Activar cápsula de refuerzo LTI"** para coordinar intervención oportuna antes del corte.

---

## 3. Decisiones de Diseño Visual, UX y Accesibilidad

Aplicando las directrices de [`AGENTS.md`](../AGENTS.md) y las *skills* de desarrollo web del proyecto (`frontend-design`, `shadcn`, `tailwind-css-patterns`, `accessibility`, `composition-patterns`, `react-best-practices`, `typescript-advanced-types`):

1. **Cero "Card-ception"**: Se priorizaron superficies limpias de un solo nivel (`border-slate-200 bg-white rounded-3xl shadow-none`) con jerarquía clara mediante tipografía (`Comfortaa` en títulos y cifras clave + `Inter` en etiquetas y tablas) y alineación estricta `tabular-nums` en todos los porcentajes, puntajes y conteos.
2. **Paleta Oficial Quack con Alto Contraste**: El `Amber Yellow` (`#FFC800`) y `Dandelion` (`#FFE978`) actúan como acento semántico y de foco sobre texto `Gunmetal Gray` (`#3B4151`) y superficies claras `#fffcf2` / `#ffffff`, reservando el contraste oscuro `#151922` únicamente para el Hero KPI principal de aprobación directiva.
3. **Gráficas SVG Ligeras y Accesibles**: [`DualTrendChart`](../src/components/analytics/Charts.tsx) y [`ErrorDonutBreakdown`](../src/components/analytics/Charts.tsx) no añaden dependencias externas pesadas (manteniendo el bundle ligero), exponen `role="img"` con `aria-label` descriptivos y ofrecen áreas de interacción amplias en cada punto temporal.
4. **Accesibilidad WCAG 2.2**:
   - Todos los selectores de vista, cursos y facultades emplean semántica `role="tablist"` / `role="tab"` y `aria-selected`.
   - Los modales (subida de material e inspección individual de estudiante) implementan `role="dialog"`, `aria-modal="true"`, `aria-labelledby` y cierre por tecla `Escape`.
   - Los iconos decorativos usan `aria-hidden="true"` y los botones de solo icono proveen `aria-label`.
5. **Rendimiento y Code Splitting**: `StatisticsPage` y sus sub-vistas se cargan de forma diferida (`React.lazy`), asegurando que la Landing Page pública (`/`) no descargue analítica ni el SDK `@google/genai`.
