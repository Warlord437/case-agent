/**
 * Collapse runs of whitespace / blank lines into single spaces,
 * trim leading/trailing whitespace, and strip null bytes.
 */
export function normalizeText(raw: string): string {
  return raw
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
