# Especificación de Producto — Quack MVP

Este documento detalla los requerimientos funcionales, el perfil del usuario, la propuesta de valor y las historias de usuario aprobadas para **Quack MVP**.

---

## 1. Perfil del Usuario y Problema

- **Persona Arquetipo**: Camilo (20 años), estudiante de 1° a 3° año de carreras STEM (Ingeniería de Sistemas, Electrónica, etc.).
- **Dolor Principal**:
  - **Ilusión de Competencia (93.9%)**: Al estudiar leyendo pasivamente resúmenes generados por IA (ChatGPT, Claude) siente que entiende, pero al enfrentarse a la **hoja en blanco en un parcial a libro cerrado**, experimenta bloqueos mentales.
  - **Lectura Pasiva sin Active Recall (75.8%)**: Falta de un método riguroso que lo obligue a evocar activamente y justificar el razonamiento paso a paso.
- **Motivación Clave**: Superar la ansiedad del papel en blanco, comprobar su dominio real con antelación y aprobar los parciales con notas sobresalientes.

---

## 2. Propuesta de Valor Única (UVP)

> **"Quack: La primera IA a la que tú le enseñas."**
> Erradica la ilusión de saber y convierte el estudio pasivo en dominio autónomo comprobado a libro cerrado.

### Descarte Explícito
> [!WARNING]
> La funcionalidad **"Radar Docente"** (dashboard analítico para profesores) fue **TOTALMENTE DESCARTADA** para este MVP. No debe implementarse ninguna pantalla, servicio ni métrica destinada a roles docentes.

---

## 3. Historias de Usuario Aprobadas

### HU-01: Modo Feynman Oral (IA Invertida)
- **Como** estudiante de ingeniería (Camilo),
- **Quiero** explicarle a Quack mediante mi propia voz la deducción o resolución de un concepto STEM,
- **Para** que la IA detecte mis vacíos conceptuales, me contrapregunte socratícamente y confirme si realmente domino el tema.

#### Criterios de Aceptación:
1. **Push-to-Talk fluido**: El estudiante pulsa un botón de micrófono para hablar y al soltarlo el sistema procesa el audio usando la Web Speech API del navegador.
2. **Rol de "Alumna Despistada"**: Quack formula contrapreguntas socráticas cortas (1-2 oraciones) cuestionando suposiciones o pidiendo definiciones simples. **Regla estricta: Jamás entrega la respuesta correcta ni completa los pasos por el estudiante**.
3. **Reproducción por Voz (TTS)**: Cada respuesta de Quack se reproduce por audio de forma automática con controles para pausar o repetir.
4. **Matriz de Subconceptos Clave**: Un panel lateral visualiza qué subconceptos esenciales han sido cubiertos y cuáles faltan por explicar.
5. **Fallback Accesible**: Si el navegador no soporta entrada de voz, debe presentarse un campo de texto alternativo sin fallos visuales ni errores de consola.

---

### HU-02: Parcial a Ciegas con Auditoría OCR
- **Como** estudiante de ingeniería (Camilo),
- **Quiero** resolver un ejercicio desafiante a mano en una hoja de papel bajo un cronómetro estricto a libro cerrado y subir una foto de mi desarrollo,
- **Para** recibir una auditoría que califique los pasos intermedios (no solo la respuesta final) y me indique con precisión matemática en qué línea se rompió mi procedimiento.

#### Criterios de Aceptación:
1. **Fase de Enfoque con Cronómetro**: Pantalla limpia de examen a libro cerrado con temporizador regresivo/progresivo.
2. **Carga y Muestras Rápidas**: Zona de carga de fotos (`Drag & Drop`) que además incluya **botones con exámenes de muestra predefinidos** para probar la auditoría de forma inmediata.
3. **Segmentación y Extracción Paso a Paso en KaTeX**: La auditoría debe desglosar cada línea del procedimiento en notación matemática formal renderizada con KaTeX.
4. **Clasificación Estricta de Errores**: Cada paso debe categorizarse con uno de los siguientes estados:
   - `CORRECT` (Verde): Paso matemáticamente consistente.
   - `ALGEBRAIC_ERROR` (Ámbar): Error de signo, despeje o simplificación aritmética.
   - `CONCEPTUAL_ERROR` (Rojo): Aplicación errónea de teoremas o leyes fundamentales.
   - `PROPAGATED_ERROR` (Gris): Consecuencia inevitable de un error previo donde el paso actual es coherente con el resultado arrastrado.
5. **Calificación Parcial**: El sistema calcula un puntaje cuantitativo sobre 5.0 reconociendo los pasos correctos previos al fallo.
