import { getLeadEndpoint } from "./_lib/gemini.js";
import {
  enforceMethod,
  readJsonBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from "./_lib/http.js";

interface LeadRequestBody {
  email?: string;
  source?: string;
  variant?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (!enforceMethod(req, res, "POST")) return;

  try {
    const body = await readJsonBody<LeadRequestBody>(req);
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!EMAIL_PATTERN.test(email)) {
      sendJson(res, 400, { ok: false, mode: "local", error: "Correo electrónico inválido." });
      return;
    }

    const endpoint = getLeadEndpoint();
    if (!endpoint) {
      sendJson(res, 200, { ok: false, mode: "local" });
      return;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        source: typeof body.source === "string" ? body.source : "unknown",
        variant: typeof body.variant === "string" ? body.variant : "A",
        createdAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      sendJson(res, 502, { ok: false, mode: "local", error: `HTTP ${response.status}` });
      return;
    }

    sendJson(res, 200, { ok: true, mode: "remote" });
  } catch (err) {
    console.warn("[api/leads] Error enviando prospecto al endpoint remoto:", err);
    sendJson(res, 502, { ok: false, mode: "local" });
  }
}
