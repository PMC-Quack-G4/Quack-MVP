import { GoogleGenAI } from "@google/genai";
import { ExamProblem, MockAuditResult } from "@/types/exam";
import { IOcrAuditService } from "./types";
import { mockOcrAuditService } from "./mockOcrAuditService";

/**
 * Servicio de Auditoría OCR conectado a Google Gemini Flash Vision.
 * Audita procedimientos manuscritos y desglosa pasos en KaTeX con clasificación de fallos.
 * Conmuta automáticamente al MockOcrAuditService ante cualquier error o falta de credenciales.
 */
export class GeminiOcrAuditService implements IOcrAuditService {
  private client: GoogleGenAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn("Fallo al inicializar GoogleGenAI SDK para OCR:", err);
      }
    }
  }

  async auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string
  ): Promise<MockAuditResult> {
    if (!this.client || !this.apiKey || !imageBase64OrUrl.startsWith("data:image")) {
      return mockOcrAuditService.auditSolution(problem, imageBase64OrUrl);
    }

    try {
      const match = imageBase64OrUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!match) {
        return mockOcrAuditService.auditSolution(problem, imageBase64OrUrl);
      }

      const mimeType = match[1];
      const base64Data = match[2];

      const systemInstruction = `
Eres un auditor riguroso y pedagógico de procedimientos matemáticos y físicos manuscritos.
Analiza la imagen proporcionada correspondiente a la resolución del siguiente problema:
Enunciado: "${problem.statementLatex}"

INSTRUCCIONES:
1. Segmenta cada línea o renglón de la demostración/cálculo.
2. Transcribe la expresión a código LaTeX limpio para renderizar con KaTeX.
3. Clasifica el estado del paso en uno de los 4 siguientes:
   - "CORRECT": Paso matemáticamente válido.
   - "ALGEBRAIC_ERROR": Error de signo, despeje o cálculo aritmético.
   - "CONCEPTUAL_ERROR": Error grave de física o teorema mal aplicado.
   - "PROPAGATED_ERROR": El cálculo es correcto dado el número erróneo que arrastra de un paso previo.
4. Redacta un feedback conciso indicando por qué falló el paso si no es correcto y una sugerencia de corrección en LaTeX (suggestedFixLatex).
5. Asigna una calificación cuantitativa final sobre 5.0 basada en el avance lógico genuino.

FORMATO DE SALIDA JSON OBLIGATORIO:
{
  "finalScore": 4.0,
  "maxScore": 5.0,
  "summary": "Resumen conciso del desempeño",
  "diagnosisTitle": "Título diagnóstico (ej. Dominio Sólido / Error Algebraico)",
  "steps": [
    {
      "stepNumber": 1,
      "latexExpression": "expresión en LaTeX",
      "status": "CORRECT",
      "feedback": "comentario del paso",
      "suggestedFixLatex": "expresión corregida opcional"
    }
  ]
}
`;

      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: `Audita esta resolución manuscrita del problema: ${problem.title}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "";
      const parsed: MockAuditResult = JSON.parse(responseText);

      return {
        finalScore: typeof parsed.finalScore === "number" ? parsed.finalScore : 4.0,
        maxScore: 5.0,
        summary: parsed.summary || problem.mockAudit.summary,
        diagnosisTitle: parsed.diagnosisTitle || problem.mockAudit.diagnosisTitle || "Auditoría Completada",
        steps: Array.isArray(parsed.steps) ? parsed.steps : problem.mockAudit.steps,
      };
    } catch (error) {
      console.warn("Fallo en auditoría Gemini Vision. Conmutando a mock local:", error);
      return mockOcrAuditService.auditSolution(problem, imageBase64OrUrl);
    }
  }
}

export const geminiOcrAuditService = new GeminiOcrAuditService();
