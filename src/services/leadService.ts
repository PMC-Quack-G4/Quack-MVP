/**
 * Captura de prospectos (lead generator) con patrón de adaptador dual:
 *
 *   ILeadService
 *     ├── ApiLeadService   (envía a POST /api/leads; en servidor usa LEAD_ENDPOINT si existe)
 *     └── LocalLeadService (fallback: guarda en localStorage)
 *
 * Si el endpoint remoto no está configurado o falla, se conmuta de forma transparente al modo local:
 * el usuario siempre recibe su recurso gratuito.
 */

export interface LeadCapturePayload {
  email: string;
  source: string;
  variant: string;
}

export interface LeadCaptureResult {
  ok: boolean;
  mode: "remote" | "local";
}

export interface ILeadService {
  capture(payload: LeadCapturePayload): Promise<LeadCaptureResult>;
}

const STORAGE_KEY = "quack_leads";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

class LocalLeadService implements ILeadService {
  async capture(payload: LeadCapturePayload): Promise<LeadCaptureResult> {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const leads: unknown = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(leads) ? leads : [];
      list.push({ ...payload, createdAt: new Date().toISOString() });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Modo privado o almacenamiento lleno: no bloqueamos al usuario.
    }
    return { ok: true, mode: "local" };
  }
}

class ApiLeadService implements ILeadService {
  constructor(private readonly fallback: ILeadService) {}

  async capture(payload: LeadCapturePayload): Promise<LeadCaptureResult> {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = (await response.json()) as Partial<LeadCaptureResult>;
        if (data.ok && data.mode === "remote") {
          return { ok: true, mode: "remote" };
        }
      }
    } catch {
      // Fallback transparente al almacenamiento local
    }
    return this.fallback.capture(payload);
  }
}

const localService = new LocalLeadService();

export const leadService: ILeadService = new ApiLeadService(localService);
