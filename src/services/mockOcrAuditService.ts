import { ExamProblem, MockAuditResult } from "@/types/exam";
import { IOcrAuditService } from "./types";

/**
 * Servicio Mock para Parcial a Ciegas OCR.
 * Simula la segmentación paso a paso de la resolución manuscrita y la auditoría con KaTeX,
 * diferenciando entre las muestras oficiales del catálogo y fotografías externas cuando no hay conexión a Gemini.
 */
export class MockOcrAuditService implements IOcrAuditService {
  async auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string,
    _rotation = 0
  ): Promise<MockAuditResult> {
    // Simular tiempo de segmentación OCR y verificación simbólica
    await new Promise((res) => setTimeout(res, 900));

    // Si el estudiante seleccionó una muestra predefinida de OTRO problema distinto al activo
    if (
      imageBase64OrUrl.startsWith("/samples/") &&
      imageBase64OrUrl !== problem.defaultSampleImage
    ) {
      return {
        finalScore: 0.0,
        maxScore: 5.0,
        isValidSubmission: false,
        completionPercentage: 0,
        diagnosisTitle: "Evidencia No Correspondiente",
        summary: `La hoja manuscrita entregada corresponde a otro ejercicio del catálogo y no resuelve el problema solicitado: "${problem.title}" (${problem.subject}).`,
        pedagogicalRecommendation:
          "Verifica que la fotografía o muestra seleccionada corresponda exactamente al enunciado activo antes de enviar tu parcial a auditoría.",
        engineUsed: "mock",
        steps: [
          {
            stepNumber: 1,
            latexExpression: "\\text{Procedimiento detectado no coincide con: } " + problem.statementLatex,
            status: "CONCEPTUAL_ERROR",
            feedback:
              "El desarrollo manuscrito en la imagen pertenece a una temática diferente a la evaluada en este parcial.",
            suggestedFixLatex: problem.mockAudit.steps[0]?.latexExpression,
          },
        ],
      };
    }

    // Si es una foto propia subida por el usuario y cayó en fallback Mock (sin conexión a Gemini Vision)
    if (imageBase64OrUrl.startsWith("data:image")) {
      return {
        ...problem.mockAudit,
        engineUsed: "mock",
        diagnosisTitle: "Solución de Referencia (Fallback Local)",
        summary:
          "No se pudo conectar con Gemini Vision para leer los trazos de tu fotografía personalizada. A continuación se muestra el desglose canónico de referencia del ejercicio; pulsa 'Reintentar con Gemini Vision' para evaluar tu foto real.",
        isValidSubmission: true,
        completionPercentage:
          problem.mockAudit.completionPercentage ??
          Math.round((problem.mockAudit.finalScore / problem.mockAudit.maxScore) * 100),
      };
    }

    // Retorna la auditoría analítica de la muestra oficial del problema seleccionado
    return {
      ...problem.mockAudit,
      engineUsed: "mock",
      isValidSubmission: problem.mockAudit.isValidSubmission ?? true,
      completionPercentage:
        problem.mockAudit.completionPercentage ??
        Math.round((problem.mockAudit.finalScore / problem.mockAudit.maxScore) * 100),
    };
  }
}

export const mockOcrAuditService = new MockOcrAuditService();
