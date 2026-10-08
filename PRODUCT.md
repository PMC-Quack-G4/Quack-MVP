# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Estudiantes de carreras STEM (Ingeniería de Sistemas, Electrónica, etc.) que necesitan preparar exámenes rigurosos o comprender temas complejos a profundidad.

## Product Purpose
Erradicar la "ilusión de competencia" (el falso aprendizaje producto del uso pasivo de IAs genéricas) en disciplinas técnicas y matemáticas. El éxito se mide por la autonomía y solidez conceptual que alcanza el estudiante para resolver problemas matemáticos reales en papel, sin depender de respuestas pre-generadas.

## Positioning
IA Invertida (Método Feynman Oral): la plataforma no te da respuestas, asume el rol de una compañera de estudio curiosa ("alumna despistada") y el estudiante es quien debe explicarle los conceptos. Complementado con validación autónoma a papel y lápiz (Parcial a Ciegas) que evalúa mediante OCR y un auditor la lógica matemática paso a paso de tu manuscrito.

## Operating Context
Los estudiantes usarán la aplicación en su computadora personal, muchas veces en escenarios de preparación intensiva ("quemarse pestañas") para parciales universitarios. Requieren un entorno que no los distraiga y les imponga la presión temporal realista de un examen formal.

## Capabilities and Constraints
- Módulo Feynman interactivo habilitado completamente por voz empleando `Web Speech API` de los navegadores (Audio de costo cero).
- Funcionalidad de subir fotos para auditoría de desarrollo matemático manual (OCR).
- Rendimiento tipográfico y matemático renderizado consistentemente a través de `KaTeX`.
- Arquitectura de "Costo Cero y Adaptador Dual": Todo servicio de IA debe contar con un mock de datos locales (fallback) en caso de que `@google/genai` (Gemini) devuelva un error de cuota.
- **Fuera de alcance:** Cualquier funcionalidad de Dashboard para Profesores.

## Brand Commitments
- Personalidad y Mascota: Quack, el pato de goma amarillo ("Rubber duck debugging" invertido).
- Tipografía principal: `Comfortaa` para títulos e identidad, `Inter` para el cuerpo del texto.
- Paleta Cromática Institucional: Amber Yellow (#FFC800), Dandelion Yellow (#FFE978), Caramel Brown (#D96B43), Sandy Orange (#F89D4F), y Gunmetal Gray (#3B4151).
