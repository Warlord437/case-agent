import mammoth from "mammoth";
import * as XLSX from "xlsx";

const SUPPORTED_EXTENSIONS = new Set([
  "pdf",
  "docx",
  "doc",
  "txt",
  "csv",
  "xlsx",
  "xls",
  "pptx",
  "ppt",
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export interface ParsedFile {
  name: string;
  text: string;
  size: number;
}

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function isSupportedFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.has(getExtension(filename));
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const { extractText } = await import("unpdf");
  const result = await extractText(new Uint8Array(buffer));
  const pages: string[] = Array.isArray(result.text) ? result.text : [String(result.text)];
  return pages.join("\n");
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function parseSpreadsheet(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const lines: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    lines.push(`--- Sheet: ${sheetName} ---`);
    const csv = XLSX.utils.sheet_to_csv(sheet);
    lines.push(csv);
  }
  return lines.join("\n");
}

function parsePptx(buffer: Buffer): string {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const lines: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;
      lines.push(XLSX.utils.sheet_to_csv(sheet));
    }
    if (lines.join("").trim().length > 0) return lines.join("\n");
  } catch {
    /* pptx isn't a spreadsheet — expected */
  }
  return "[PowerPoint file uploaded — text extraction is limited. For best results, export as PDF or paste text directly.]";
}

export async function parseFile(
  buffer: Buffer,
  filename: string,
): Promise<ParsedFile> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `File "${filename}" is too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Max is 20 MB.`,
    );
  }

  const ext = getExtension(filename);

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Unsupported file type ".${ext}". Supported: ${[...SUPPORTED_EXTENSIONS].join(", ")}.`,
    );
  }

  let text: string;

  switch (ext) {
    case "pdf":
      text = await parsePdf(buffer);
      break;
    case "docx":
    case "doc":
      text = await parseDocx(buffer);
      break;
    case "txt":
    case "csv":
      text = buffer.toString("utf-8");
      break;
    case "xlsx":
    case "xls":
      text = parseSpreadsheet(buffer);
      break;
    case "pptx":
    case "ppt":
      text = parsePptx(buffer);
      break;
    default:
      text = buffer.toString("utf-8");
  }

  return { name: filename, text: text.trim(), size: buffer.length };
}
