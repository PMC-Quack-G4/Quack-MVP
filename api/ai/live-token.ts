import {
  createGeminiClient,
  getGeminiLiveModel,
} from "../_lib/gemini.js";
import {
  enforceMethod,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";

/**
 * Emite un token efímero (v1alpha) para conectar al cliente directamente
 * con Gemini Live API sin exponer GEMINI_API_KEY en el navegador.
 */
export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (!enforceMethod(req, res, "POST")) return;

  const client = createGeminiClient("v1alpha");
  if (!client) {
    sendJson(res, 503, { error: "GEMINI_API_KEY no configurada en el servidor." });
    return;
  }

  try {
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const authToken = await client.authTokens.create({
      config: {
        uses: 4,
        expireTime,
        newSessionExpireTime,
      },
    });

    if (!authToken.name) {
      throw new Error("Gemini no devolvió un token efímero válido.");
    }

    sendJson(
      res,
      200,
      {
        token: authToken.name,
        liveModel: getGeminiLiveModel(),
      },
      { "Cache-Control": "no-store" }
    );
  } catch (err) {
    console.warn("[api/ai/live-token] No se pudo emitir token efímero:", err);
    sendJson(res, 502, {
      error:
        err instanceof Error
          ? err.message
          : "No se pudo emitir el token efímero para Gemini Live.",
    });
  }
}
