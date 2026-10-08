# Feedback y hoja de ruta: de Quack MVP a producto piloto

**Fecha de revisión:** 7 de octubre de 2026  
**Propósito:** feedback de producto, funcionalidad, arquitectura, despliegue y experiencia para preparar el pitch y orientar la siguiente etapa.  
**Alcance de esta revisión:** lectura del README, especificación, arquitectura, backlog y código de las pantallas y servicios. No es una auditoría de seguridad, pruebas de usuario ni verificación del despliegue público.

---

## 1. Lectura ejecutiva

Quack ya tiene una historia de producto clara y fácil de recordar: el estudiante enseña, Quack pregunta; después, el estudiante demuestra lo que sabe resolviendo a mano. La combinación de práctica activa, conversación oral y auditoría del procedimiento tiene más identidad que un chatbot académico genérico. El repositorio muestra dos recorridos completos de interfaz, selección de temas y problemas, temporizador, voz con alternativa de texto, renderizado matemático, conexión a Gemini y servicios locales de respaldo.

El siguiente salto no consiste en sumar más pantallas. Consiste en hacer confiables y repetibles esos recorridos para un curso real: contenido curado y verificable, evaluación calibrada, sesiones que sobreviven a una recarga, límites claros de privacidad y una operación segura de la IA. La diferencia de producto que proponen —abrir un curso y practicar sin preparar cada prompt ni volver a subir los materiales— todavía requiere construir su pieza central: el catálogo académico y la preparación de contenido por materia.

**Recomendación de enfoque:** para el pitch, enfoquen el trabajo en que se vea la experiencia diferenciadora de principio a fin: al entrar, el estudiante encuentra una materia preparada, escoge un tema y empieza a poner a prueba sus conocimientos con Feynman o Parcial a Ciegas. Para esta versión experimental, esa materia y sus temas pueden estar preconfigurados como demostración. El acceso a plataformas universitarias y la carga real de materiales son una etapa futura; no hace falta resolverlos para que el pitch muestre cómo se sentirá el producto.

---

## 2. Lo que ya está bien encaminado

- **Propuesta fácil de explicar:** “La primera IA a la que tú le enseñas” comunica el cambio de rol mejor que una lista de funciones.
- **Dos momentos de aprendizaje conectados:** Feynman sirve para explicar y detectar vacíos; Parcial a Ciegas obliga a recuperar y aplicar el conocimiento sin mirar apuntes.
- **La experiencia guía al estudiante:** el flujo de examen separa problema, tiempo de resolución, carga de evidencia y revisión.
- **Respaldo ante fallos:** los servicios Gemini tienen una ruta de fallback local. La voz ofrece alternativa de entrada por texto.
- **Dominio visual reconocible:** el nombre, el pato, la paleta y las expresiones matemáticas renderizadas apoyan una identidad coherente.
- **Buena base de organización:** el código separa páginas, componentes, hooks, tipos, mocks y servicios; la documentación define las historias de usuario y el alcance sin panel docente.

Esto es una base convincente para validar la propuesta. Todavía no equivale a un servicio académico listo para operar con múltiples cursos y estudiantes.

---

## 3. Brechas principales para pasar a un piloto real

### 3.1 El contenido académico es el producto pendiente más importante

Hoy los selectores consumen `mockFeynmanTopics` y `mockExamProblems` desde `src/mocks/quackData.ts`. La experiencia es funcional, pero el usuario todavía escoge elementos de un catálogo de demostración. Para cumplir la promesa de “abrir la materia y estudiar”, Quack necesita un catálogo de materias, unidades, temas, objetivos y ejercicios asociado a materiales con procedencia conocida.

**Qué construir:** empezar con un curso piloto y un paquete editorial pequeño. Cada tema debería tener título, resultados de aprendizaje, prerequisitos, fuentes autorizadas, subconceptos evaluables, preguntas Feynman, ejercicios y rúbricas. Guardar versión y referencia de la fuente permite corregir el paquete sin perder trazabilidad.

**Por qué:** el valor de Quack no es solo llamar un modelo; es reducir el trabajo de preparar materiales y convertir el programa del curso en una práctica guiada y consistente.

### 3.2 La clave de Gemini no debe vivir en el navegador en un producto público

Los servicios leen `VITE_GEMINI_API_KEY` en código cliente. Las variables `VITE_` se incorporan al bundle que descarga el navegador, por lo que esa clave puede ser inspeccionada y reutilizada. Para una demo controlada puede servir una clave limitada y rotada; para un piloto abierto, la llamada debe pasar por un backend o función serverless que guarde el secreto y aplique controles por usuario.

**Qué construir:** endpoint de servidor para Feynman y OCR; límites de solicitud, tamaño y tipo de archivo; cuotas por usuario; protección contra abuso; gestión de secretos en el entorno de despliegue. Nunca poner secretos en el bundle ni en el repositorio.

### 3.3 El fallback debe ser visible y no confundirse con evaluación real

El fallback local conserva continuidad cuando Gemini falla, lo cual es útil para una demo. Sin embargo, una respuesta simulada puede parecer una evaluación auténtica si el estudiante no sabe qué motor la produjo. Para aprendizaje y confianza, la interfaz debe indicar con claridad si el resultado fue generado por IA o por una demostración local, y si no pudo procesar el envío.

**Qué construir:** estado explícito de motor y causa; opción de reintentar; registro técnico de errores sin contenido sensible; nunca usar una nota simulada como resultado académico persistente. En modo demo, rotular el resultado como demostrativo.

### 3.4 OCR y nota necesitan una política de incertidumbre

Una fotografía manuscrita puede tener mala luz, perspectiva, tachones, símbolos ambiguos o pasos fuera del encuadre. El modelo puede leer mal una línea y luego producir una calificación con apariencia precisa. Una nota numérica no debe ocultar esa incertidumbre.

**Qué construir:** evaluación de calidad de imagen antes de enviar; posibilidad de recortar o volver a tomar la foto; confianza por paso; estado “no puedo leer este paso”; vista de transcripción editable o confirmable; rúbrica explícita y desglose de cómo se obtuvo el puntaje. Diseñar una evaluación de referencia con soluciones manuscritas correctas, con errores diversos y distintas calidades de imagen.

**Principio de producto:** presentar el OCR como retroalimentación de estudio, no como calificación oficial ni sustituto de la corrección docente.

### 3.5 Sesiones y progreso necesitan persistencia

Los recorridos actuales se mantienen principalmente en estado de la página. Si el estudiante actualiza, cierra o pierde conexión, puede perder conversación, cronómetro o auditoría. Tampoco se ve en la base actual una identidad de usuario o historial de estudio persistente.

**Qué construir:** primero guardado local recuperable de borradores y estados de sesión; luego autenticación ligera y almacenamiento servidor si el piloto necesita continuidad entre dispositivos. Persistir materia, tema, duración, estado de cada intento y resumen; evitar guardar audio crudo si no es necesario.

### 3.6 “Acceder a contenidos de la universidad” requiere acuerdos y trazabilidad

Los contenidos pueden tener derechos de autor, restricciones de distribución o datos internos. La integración no debería asumirse como acceso automático a todos los libros, aulas virtuales o repositorios. El primer paso realista es acordar con un docente o programa qué fuentes se pueden usar y quién mantiene el paquete de curso.

**Qué construir:** flujo de alta y revisión del material; fuente y permiso registrados; control de versión; política de actualización y retiro; referencias visibles para el estudiante. No recopilar contraseñas de plataformas institucionales ni copiar material sin autorización.

---

## 4. Hoja de ruta priorizada para llegar al pitch

Las **fases 0, 1 y 2 son el trabajo previo al pitch de mañana a las 2:00 p. m.** Están ordenadas por prioridad para que primero se vea la propuesta de valor funcionando, después la versión desplegada sea demostrable y, al final, se pula su presentación. El objetivo no es terminar un producto de producción ni implementar todo el acceso institucional: es desplegar una versión experimental que haga tangible la experiencia personalizada de Quack.

### Fase 0 — Hacer visible la diferenciación funcional

**Prioridad máxima: el estudiante debe sentir que entra a estudiar una materia preparada, no a escoger entre demos genéricas.**

- Preparar **una materia de ejemplo representativa** con nombre, breve descripción, unidades y un conjunto acotado de temas. Se puede usar contenido semimoqueado y curado manualmente para el pitch.
- Crear un punto de entrada que represente la experiencia personalizada: después de entrar como estudiante (puede ser un perfil de demostración, sin construir autenticación real para mañana), la materia y sus materiales de demostración ya están listos; el estudiante elige tema y método para empezar.
- Hacer que cada tema lleve a sus dos formas de práctica: una sesión Feynman que use los subconceptos de ese tema y un parcial a ciegas con un problema relacionado. El contenido de ambos módulos debe sentirse parte del mismo curso.
- Priorizar un solo recorrido completo y estable sobre cantidad de materias: entrar → elegir tema → explicar a Quack o resolver a mano → recibir feedback.
- Conservar los ejemplos actuales para testing y exploración. Dejarlos accesibles desde un botón o enlace secundario, menos prominente que la materia principal, por ejemplo **“Explorar ejemplos de demostración”**. No borrarlos ni mezclarlos con la ruta principal.
- Identificar con claridad qué datos del curso están preparados para la demo y qué respuestas de IA son reales o simuladas. La personalización del pitch puede ser preconfigurada; no implica todavía importar el curso desde una plataforma universitaria.

**Criterio de cierre:** alguien que vea la demo entiende en pocos minutos que Quack prepara una materia y convierte sus temas en práctica activa por dos métodos complementarios.

### Fase 1 — Desplegar y asegurar la demostración

**Prioridad alta: poder mostrar el recorrido desde una URL real y tener una salida si falla la red o la cuota de Gemini.**

- Publicar la versión experimental por HTTPS y comprobar el flujo desde la URL de producción, incluyendo entrada directa y recarga en las rutas `/feynman` y `/parcial-ciegas`.
- Confirmar antes del pitch qué partes llaman a Gemini y cuáles usan fallback/mock. Revisar cuota y tener lista una captura, grabación o resultado de respaldo para la demo.
- Mostrar errores recuperables y distinguir los resultados locales de las evaluaciones generadas por Gemini; evitar que una salida simulada parezca calificación real.
- Probar el recorrido en el dispositivo y navegador que usarán para presentar. Revisar micrófono, permisos, voz, carga de foto y calidad de la muestra OCR.
- Para esta demo controlada, limitar el uso de la clave/API y no exponer credenciales en el repositorio. La migración de llamadas a un backend seguro debe ser requisito antes de abrir el acceso a usuarios externos, aunque no sea el objetivo de pulido visual previo al pitch.
- Tener un plan B corto y ensayado: muestra manuscrita legible, resultado ya obtenido y forma de continuar la presentación si hay problemas de red o cuota.

**Criterio de cierre:** el equipo puede demostrar desde producción el flujo principal y explicar honestamente dónde hay IA real, dónde hay datos preparados y qué respaldo existe.

### Fase 2 — Pulir la presentación del flujo

**Prioridad después de la funcionalidad: quitar fricción y hacer que la experiencia se sienta coherente, sin buscar un acabado exhaustivo.**

- Hacer que la materia y el siguiente paso sean el foco visual; reducir el protagonismo de nombres técnicos como “OCR”, “Gemini” y “Módulo 1/2”.
- Alinear el lenguaje de selección de materia, unidad, tema, explicación y parcial para que el recorrido no se sienta como dos demos separadas.
- Dar instrucciones breves antes de comenzar cada método y hacer visibles los controles principales: iniciar, terminar, reintentar, cambiar de tema y volver al curso.
- Revisar tamaños y jerarquía de botones, estados de carga y errores, legibilidad de fórmulas y ajuste básico a móvil; pulir primero las pantallas que recorrerán durante el pitch.
- Mantener accesibles los ejemplos existentes, pero como opción secundaria de testing, sin competir con la materia protagonista.
- Ensayar una demo breve con inicio y cierre: presentar el curso preparado, mostrar una interacción Feynman, mostrar la auditoría OCR y cerrar con el valor de practicar sin preparar prompts o subir materiales cada vez.

**Criterio de cierre:** el recorrido se entiende y se ve consistente durante la presentación, aunque el contenido siga siendo experimental y preconfigurado.

### Después del pitch — Evolución futura, no requisito para mañana

- Conectar materiales reales de una materia después de acordar permisos, fuentes, responsables de revisión y actualización. El acceso a plataformas universitarias y la carga real de materiales pertenecen a esta etapa futura.
- Expandir de la materia de demostración a un piloto con curso y temas aprobados; mantener trazabilidad y versiones del contenido.
- Construir backend para proteger claves, aplicar cuotas y gestionar datos de usuario antes de invitar a una audiencia más amplia.
- Agregar persistencia de sesiones, autenticación y recuperación entre dispositivos cuando el piloto lo requiera.
- Calibrar OCR y puntuaciones con soluciones de referencia; mostrar incertidumbre, permitir corregir la transcripción y validar con estudiantes.
- Evaluar privacidad, retención y borrado para voz, fotografías y conversaciones; crear proceso de operación de contenido sin añadir un panel docente al alcance del MVP.
- Medir adopción, utilidad percibida, errores de lectura, finalización, retorno a la práctica, latencia y costo por sesión.

---

## 5. Mejoras concretas a los dos flujos

### Feynman Oral

- **Explicar la dinámica antes de iniciar:** qué debe hacer el estudiante, qué hace Quack, cuánto dura y cómo terminar.
- **Permitir corregir la transcripción:** el reconocimiento de voz puede confundir términos STEM, nombres y símbolos. Antes de enviar, mostrar texto editable o una opción de corrección.
- **Dar control de audio:** silenciar TTS, pausar/repetir y mostrar siempre el texto. El audio automático puede ser incómodo en espacios públicos.
- **Hacer visibles los criterios de dominio:** mostrar qué evidencia concreta cuenta como explicación correcta, parcial o pendiente; mantener el rol de alumna sin felicitar por respuestas incorrectas.
- **Ofrecer repaso útil al cierre:** 2–3 vacíos detectados, evidencia de lo que sí explicó y una recomendación de siguiente práctica. No afirmar que domina un tema solo porque el modelo lo marcó.
- **Agregar salida y recuperación:** pausar, terminar, reiniciar y recuperar una sesión con consecuencias claras.

### Parcial a Ciegas OCR

- **Mejorar captura móvil:** guía de encuadre, iluminación, enfoque, orientación, varias páginas y reintento antes de enviar.
- **Mostrar qué logró leer:** separar lectura de la escritura y evaluación matemática. Si la transcripción es dudosa, pedir confirmación antes de asignar nota.
- **Conectar error con paso y criterio:** explicar el tipo de error, su impacto y qué revisar. La corrección debe ayudar a razonar sin convertir la plataforma en una respuesta copiable.
- **Explicar la nota:** mostrar rúbrica, puntos por paso y propagación de errores con consistencia verificable.
- **Distinguir práctica de evaluación formal:** dejar visible que la calificación es orientativa y puede fallar con escritura ambigua.
- **Permitir revisar el resultado:** comparación entre imagen, transcripción y evaluación, con una ruta para corregir una lectura equivocada.

---

## 6. UX, accesibilidad y acabado visual

- Reducir los títulos de “Módulo 1/2” en el producto final; usar nombres centrados en el beneficio (“Explícale el tema a Quack”, “Comprueba tu procedimiento”) y reservar nomenclatura técnica para detalles.
- Mantener consistentes “tema”, “subtema”, “problema”, “auditoría” y “evaluación”; evitar que “OCR”, “Gemini” o “KaTeX” sean el lenguaje principal de la interfaz.
- Revisar versión móvil de checklist, split view, temporizador y captura; el OCR probablemente se usará desde el teléfono.
- Validar navegación por teclado, foco visible, etiquetas, contraste, mensajes de error anunciables y respeto por `prefers-reduced-motion`.
- Asegurar que ninguna información dependa solo del color: acompañar badges con texto e iconos.
- Ofrecer controles visibles para voz y volumen; mantener una alternativa textual completa.
- Diseñar estados vacíos, carga, fallo, API limitada, sesión terminada y pérdida de conexión con el mismo nivel de cuidado que el estado exitoso.
- Revisar consistencia del lenguaje español y acentos; el tono simpático debe seguir siendo respetuoso cuando el estudiante se equivoca.

---

## 7. Métricas que ayudarían a validar la propuesta

No optimicen solo por cantidad de sesiones o mensajes. Métricas iniciales posibles:

| Pregunta | Señal que se puede medir |
|---|---|
| ¿El estudiante logra empezar sin ayuda? | Porcentaje que inicia una sesión tras elegir materia/tema; tiempo hasta el primer intento. |
| ¿La práctica termina siendo activa? | Sesiones completadas; proporción de turnos donde el estudiante explica; problemas intentados antes de ver feedback. |
| ¿El feedback se entiende? | Valoración breve posterior y porcentaje que puede identificar su siguiente paso. |
| ¿La IA es confiable? | Lecturas OCR que requieren corrección, resultados de baja confianza, evaluaciones reportadas como incorrectas. |
| ¿Quack genera hábito útil? | Repetición semanal por tema, no solo tiempo en pantalla. |
| ¿La operación aguanta? | Latencia, errores, tasa de fallback, consumo/costo por sesión y cuotas agotadas. |

Recolectar datos mínimos, explicar su uso y evitar medir audio/transcripciones por defecto. Para un proyecto académico, la confianza y el aprendizaje importan más que una métrica de “engagement” aislada.

---

## 8. Mensaje sugerido para el pitch

> **Quack convierte el temario de una materia en práctica activa lista para usar. El estudiante no le pide a una IA que le resuma el curso: primero le explica el concepto a una compañera curiosa y luego resuelve a mano un problema sin apuntes. Quack devuelve preguntas y retroalimentación por pasos para que pueda detectar qué entiende y qué necesita trabajar. Para esta versión experimental estamos preparando una materia y temas de demostración para mostrar ese flujo; el siguiente paso será validarlo con un curso piloto y conectar contenido real con las autorizaciones correspondientes.**

### Frase de diferenciación

> **La IA genérica responde por ti; Quack organiza una práctica en la que tienes que demostrar lo que sabes.**

Úsenla como hipótesis de valor, no como afirmación comprobada de superioridad frente a todos los competidores. El piloto debe ayudar a validar si ese flujo mejora la preparación y resulta fácil de adoptar.

---

## 9. Prioridad recomendada

Si solo pueden escoger tres frentes después del pitch:

1. **Seguridad y operación de Gemini:** backend/función serverless antes de usuarios externos; cuota y manejo de fallos visibles.
2. **Curso piloto con contenido autorizado:** una materia y un paquete pequeño, revisado y versionado; de ahí sale la experiencia de catálogo que promete el producto.
3. **Confiabilidad de la evaluación:** confianza y confirmación de lectura OCR, rúbrica transparente, casos de referencia y salida honesta cuando no se puede evaluar.

Después, prioricen persistencia de sesión y pruebas de uso con estudiantes. Posterguen expansión a muchas materias, gamificación extensa y panel docente hasta probar la experiencia base.

---

## 10. Límites de esta revisión

Esta lectura está basada en archivos del repositorio. No se probó el sitio desplegado, la API en producción, las claves configuradas, la latencia real, el comportamiento en distintos navegadores ni la calidad de respuestas con un conjunto representativo de usuarios. La afirmación de que ambos flujos funcionan contra Gemini corresponde al contexto compartido por el equipo; debe confirmarse en producción y demostrarse con una llamada real controlada durante el pitch.
