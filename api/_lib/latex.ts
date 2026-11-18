export function sanitizeLatexExpression(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/\x08/g, "\\b")
    .replace(/\x0c/g, "\\f")
    .replace(/\x09/g, "\\t")
    .replace(/\x0d/g, "\\r")
    .trim()
    .replace(/^```(?:latex|tex)?\s*/i, "")
    .replace(/```$/i, "")
    .replace(/^\$\$\s*/, "")
    .replace(/\s*\$\$$/, "")
    .replace(/^\$\s*/, "")
    .replace(/\s*\$$/, "")
    .replace(/^\\\[\s*/, "")
    .replace(/\s*\\\]$/, "")
    .replace(/^\\\(\s*/, "")
    .replace(/\s*\\\)$/, "")
    .trim();
}

export function parseGeminiJsonWithLatex<T>(responseText: string): T {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const rawJson = (
    jsonMatch
      ? jsonMatch[0]
      : responseText
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
  ).trim();

  const latexSafeJson = rawJson.replace(
    /\\(\\|"|\/|u[0-9a-fA-F]{4}|n(?![a-zA-Z]))|\\(.)/g,
    (match, validEscape, latexChar) => {
      if (validEscape) {
        return match;
      }
      return "\\\\" + latexChar;
    }
  );

  try {
    return JSON.parse(latexSafeJson) as T;
  } catch {
    return JSON.parse(rawJson) as T;
  }
}
