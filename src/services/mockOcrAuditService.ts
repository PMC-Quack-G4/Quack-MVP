import { ExamProblem, MockAuditResult } from "@/types/exam";
import { IOcrAuditService } from "./types";

/**
 * Servicio Mock para Parcial a Ciegas OCR.
 * Simula la segmentación paso a paso de la resolución manuscrita y la auditoría con KaTeX.
 */
export class MockOcrAuditService implements IOcrAuditService {
  async auditSolution(
    problem: ExamProblem,
    _imageBase64OrUrl: string
  ): Promise<MockAuditResult> {
    // Simular tiempo de segmentación OCR y verificación simbólica
    await new Promise((res) => setTimeout(res, 1200));

    // Retorna la auditoría analítica del problema seleccionado
    return problem.mockAudit;
  }
}

export const mockOcrAuditService = new MockOcrAuditService();
