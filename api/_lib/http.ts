import type { IncomingMessage, ServerResponse } from "node:http";

export interface ApiRequest extends IncomingMessage {
  body?: unknown;
}

export type ApiResponse = ServerResponse;

const MAX_BODY_BYTES = 8 * 1024 * 1024; // 8 MB safety ceiling

export function sendJson(
  res: ApiResponse,
  statusCode: number,
  payload: unknown,
  extraHeaders: Record<string, string> = {}
): void {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  res.end(body);
}

export function enforceMethod(
  req: ApiRequest,
  res: ApiResponse,
  allowedMethod: "GET" | "POST"
): boolean {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Allow", `${allowedMethod}, OPTIONS`);
    res.end();
    return false;
  }

  if (req.method !== allowedMethod) {
    sendJson(
      res,
      405,
      { error: `Método ${req.method || "DESCONOCIDO"} no permitido. Usa ${allowedMethod}.` },
      { Allow: `${allowedMethod}, OPTIONS` }
    );
    return false;
  }

  return true;
}

export async function readJsonBody<T>(req: ApiRequest): Promise<T> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") {
      return JSON.parse(req.body) as T;
    }
    if (Buffer.isBuffer(req.body)) {
      return JSON.parse(req.body.toString("utf8")) as T;
    }
    if (typeof req.body === "object") {
      return req.body as T;
    }
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk, "utf8") : chunk;
    totalBytes += buffer.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw new Error("El cuerpo de la solicitud excede el tamaño máximo permitido.");
    }
    chunks.push(buffer);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {} as T;
  }

  return JSON.parse(raw) as T;
}
