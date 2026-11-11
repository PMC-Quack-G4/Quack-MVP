import { getActiveModel, isGeminiActive } from "@/lib/aiConfig";
import type {
  CourseAccentTone,
  CourseTopicItem,
  ExamProblem,
  FeynmanTopic,
  UploadedMaterial,
} from "@/types";

export interface MaterialExtractionInput {
  courseTitle: string;
  discipline: string;
  fileName: string;
  fileType: "pdf" | "code" | "notes" | "slides";
  sizeLabel: string;
  rawTextContent: string;
  accentTone?: CourseAccentTone;
}

export interface GeneratedMaterialBundle {
  material: UploadedMaterial;
  courseTopic: CourseTopicItem;
  feynmanTopic: FeynmanTopic;
  examProblem: ExamProblem;
  engineUsed: "gemini" | "mock";
}

function slugifyId(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "tema-propio"
  );
}

function extractKeywordsFromText(text: string, fallbackTitle: string): string[] {
  const stop = new Set([
    "para",
    "como",
    "entre",
    "sobre",
    "desde",
    "hasta",
    "cuando",
    "donde",
    "este",
    "esta",
    "estos",
    "estas",
    "unos",
    "unas",
    "porque",
    "sobre",
    "hacia",
    "cada",
    "tiene",
    "pueden",
    "mediante",
  ]);
  const tokens = `${fallbackTitle} ${text}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !stop.has(w));
  return Array.from(new Set(tokens)).slice(0, 12);
}

function buildLocalFallbackBundle(input: MaterialExtractionInput): GeneratedMaterialBundle {
  const stamp = Date.now().toString(36);
  const baseSlug = slugifyId(input.courseTitle || input.fileName);
  const feynmanId = `custom-feyn-${baseSlug}-${stamp}`;
  const examId = `custom-exam-${baseSlug}-${stamp}`;
  const topicItemId = `custom-topic-${baseSlug}-${stamp}`;

  const cleanFileTitle = input.fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  const topicTitle =
    input.rawTextContent.trim().length > 10 && input.courseTitle
      ? `${input.courseTitle}: ${cleanFileTitle || "Fundamentos Clave"}`
      : cleanFileTitle || input.courseTitle || "Conceptos Clave del Material";

  const keywords = extractKeywordsFromText(input.rawTextContent, `${input.courseTitle} ${cleanFileTitle}`);
  const kw1 = keywords[0] || "concepto";
  const kw2 = keywords[1] || "principio";
  const kw3 = keywords[2] || "aplicacion";

  const subtopics = [
    {
      id: `${feynmanId}-sub-1`,
      name: `Definición e intuición de ${cleanFileTitle || input.courseTitle}`,
      description: `Explicar con tus palabras el propósito de ${kw1} y ${kw2} sin depender de memorización literal.`,
      covered: false,
    },
    {
      id: `${feynmanId}-sub-2`,
      name: `Condiciones de validez y relaciones clave (${kw2})`,
      description: `Identificar qué hipótesis deben cumplirse y cómo interactúan las variables principales.`,
      covered: false,
    },
    {
      id: `${feynmanId}-sub-3`,
      name: `Aplicación práctica y casos límite (${kw3})`,
      description: `Resolver un escenario concreto o detectar qué falla si se rompe una condición del modelo.`,
      covered: false,
    },
  ];

  const feynmanTopic: FeynmanTopic = {
    id: feynmanId,
    title: topicTitle,
    category: input.discipline,
    difficulty: "Intermedio",
    promptContext:
      input.rawTextContent.trim().slice(0, 400) ||
      `Material propio cargado por el estudiante desde ${input.fileName} para la materia ${input.courseTitle}.`,
    subtopics,
    mockDialogue: [
      {
        triggerWords: [kw1, "definicion", "significa", "sirve", "consiste"],
        quackReply: `¡Oye, qué interesante lo de ${input.fileName}! Pero explícame como si fuera de primer semestre: ¿cuál es la idea central de "${subtopics[0].name}"?`,
        unlocksSubtopicId: subtopics[0].id,
      },
      {
        triggerWords: [kw2, "condicion", "regla", "depende", "formula", "relacion"],
        quackReply: `¡Ajá! ¿Y qué condición o regla matemática/científica tiene que cumplirse sí o sí para que eso funcione y no nos dé un error?`,
        unlocksSubtopicId: subtopics[1].id,
      },
      {
        triggerWords: [kw3, "ejemplo", "caso", "limite", "error", "practica"],
        quackReply: `¡Súper! Y si tuvieras que aplicarlo en un parcial a libro cerrado, ¿cuál sería el error más típico que debería evitar?`,
        unlocksSubtopicId: subtopics[2].id,
      },
    ],
    fallbackReply:
      "Mmm, me perdí un poquito con los términos técnicos de tus apuntes. ¿Podrías explicármelo con una analogía sencilla?",
  };

  const examProblem: ExamProblem = {
    id: examId,
    title: `Simulacro OCR: ${cleanFileTitle || input.courseTitle}`,
    subject: input.discipline,
    difficulty: "Medio",
    statementLatex: `\\text{Basado en } \\texttt{${input.fileName.replace(/[_]/g, "\\_")}}:\\ \\text{Plantea y resuelve paso a paso el modelo principal de } \\text{${input.courseTitle.slice(0, 38)}}.`,
    estimatedMinutes: 15,
    defaultSampleImage: "/samples/sample_exam_custom.svg",
    mockAudit: {
      finalScore: 4.3,
      maxScore: 5.0,
      diagnosisTitle: "Procedimiento Sólido sobre Material Propio",
      summary: `Auditoría generada para tu archivo ${input.fileName}. Se validó el planteamiento inicial y la coherencia de los pasos intermedios.`,
      completionPercentage: 90,
      isValidSubmission: true,
      pedagogicalRecommendation:
        "Buen dominio del procedimiento basado en tus apuntes. Verifica las unidades o condiciones de frontera en el último paso para asegurar el 5.0.",
      steps: [
        {
          stepNumber: 1,
          latexExpression: `\\text{1) Variables y supuestos extraídos de } \\text{${cleanFileTitle || "apuntes"}}`,
          status: "CORRECT",
          feedback: "Planteamiento coherente con los conceptos del documento cargado.",
        },
        {
          stepNumber: 2,
          latexExpression: "\\text{2) Ecuación o invariante gobernante del sistema}",
          status: "CORRECT",
          feedback: "Relación fundamental correctamente formulada.",
        },
        {
          stepNumber: 3,
          latexExpression: "\\text{3) Simplificación intermedia y verificación de signo}",
          status: "ALGEBRAIC_ERROR",
          feedback: "Revisa un coeficiente menor en la simplificación intermedia antes de evaluar.",
          suggestedFixLatex: "\\text{Verificar signo del término acoplado antes de despejar}",
        },
        {
          stepNumber: 4,
          latexExpression: "\\text{4) Conclusión verificada con las hipótesis iniciales}",
          status: "CORRECT",
          feedback: "Resultado consistente con la interpretación física/algorítmica.",
        },
      ],
    },
  };

  const material: UploadedMaterial = {
    id: `mat-${stamp}`,
    fileName: input.fileName,
    fileType: input.fileType,
    sizeLabel: input.sizeLabel,
    uploadedAt: "Recién cargado",
    extractedTopicsCount: 1,
    summary:
      input.rawTextContent.trim().slice(0, 140) ||
      `Tema Feynman + Simulacro OCR generados automáticamente desde ${input.fileName}.`,
  };

  const courseTopic: CourseTopicItem = {
    id: topicItemId,
    title: topicTitle,
    unitLabel: `Archivo: ${input.fileName}`,
    summary: material.summary,
    estimatedMinutes: 15,
    feynmanTopicId: feynmanId,
    examProblemId: examId,
    masteryPercent: 0,
    status: "pending",
  };

  return {
    material,
    courseTopic,
    feynmanTopic,
    examProblem,
    engineUsed: "mock",
  };
}

/**
 * Extrae subconceptos Feynman y un problema de Parcial OCR a partir de un archivo/apunte del estudiante B2C.
 * Usa Google Gemini si VITE_GEMINI_API_KEY está configurada y conmuta sin fallos al extractor local en modo Mock.
 */
export async function generateStudyBundleFromMaterial(
  input: MaterialExtractionInput
): Promise<GeneratedMaterialBundle> {
  const fallback = buildLocalFallbackBundle(input);
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();

  if (!isGeminiActive() || !apiKey || input.rawTextContent.trim().length < 20) {
    await new Promise((r) => setTimeout(r, 650));
    return fallback;
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const client = new GoogleGenAI({ apiKey });
    const prompt = `Eres un diseñador pedagógico STEM para Quack.
El estudiante subió este material para la materia "${input.courseTitle}" (${input.discipline}), archivo "${input.fileName}":
---
${input.rawTextContent.slice(0, 3500)}
---
Devuelve EXCLUSIVAMENTE un JSON válido sin markdown con esta estructura:
{
  "topicTitle": "Título conciso del tema principal",
  "summary": "Resumen en 1 frase",
  "subtopics": [
    { "name": "Subconcepto 1", "description": "Qué debe demostrar el estudiante" },
    { "name": "Subconcepto 2", "description": "Qué debe demostrar el estudiante" },
    { "name": "Subconcepto 3", "description": "Qué debe demostrar el estudiante" }
  ],
  "examTitle": "Título de un ejercicio tipo parcial sobre este material",
  "statementLatex": "Enunciado corto en LaTeX válido (ej. \\\\text{...})"
}`;

    const response = await client.models.generateContent({
      model: getActiveModel(),
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.4 },
    });

    const text = response.text?.trim() ?? "";
    const parsed = JSON.parse(text) as {
      topicTitle?: string;
      summary?: string;
      subtopics?: { name: string; description?: string }[];
      examTitle?: string;
      statementLatex?: string;
    };

    if (parsed.topicTitle && Array.isArray(parsed.subtopics) && parsed.subtopics.length >= 2) {
      const mappedSubtopics = parsed.subtopics.slice(0, 4).map((s, idx) => ({
        id: `${fallback.feynmanTopic.id}-sub-${idx + 1}`,
        name: s.name,
        description: s.description ?? "",
        covered: false,
      }));

      return {
        ...fallback,
        engineUsed: "gemini",
        material: {
          ...fallback.material,
          summary: parsed.summary || fallback.material.summary,
        },
        courseTopic: {
          ...fallback.courseTopic,
          title: parsed.topicTitle,
          summary: parsed.summary || fallback.courseTopic.summary,
        },
        feynmanTopic: {
          ...fallback.feynmanTopic,
          title: parsed.topicTitle,
          subtopics: mappedSubtopics,
        },
        examProblem: {
          ...fallback.examProblem,
          title: parsed.examTitle || fallback.examProblem.title,
          statementLatex: parsed.statementLatex || fallback.examProblem.statementLatex,
        },
      };
    }
  } catch (err) {
    console.warn("Material generator fallback a extractor local:", err);
  }

  return fallback;
}
