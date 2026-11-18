import {
  getGaMeasurementId,
  getGeminiApiKey,
  getGeminiLiveModel,
  getGeminiModel,
} from "./_lib/gemini.js";
import {
  enforceMethod,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from "./_lib/http.js";

export default function handler(req: ApiRequest, res: ApiResponse): void {
  if (!enforceMethod(req, res, "GET")) return;

  sendJson(
    res,
    200,
    {
      geminiActive: Boolean(getGeminiApiKey()),
      model: getGeminiModel(),
      liveModel: getGeminiLiveModel(),
      gaMeasurementId: getGaMeasurementId(),
    },
    { "Cache-Control": "no-store" }
  );
}
