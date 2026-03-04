import { NextRequest, NextResponse } from "next/server";
import { parseFile, isSupportedFile } from "@backend/lib/parse-file";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded." },
        { status: 400 },
      );
    }

    const results: { name: string; text: string; size: number }[] = [];
    const errors: string[] = [];

    for (const entry of files) {
      if (!(entry instanceof File)) {
        errors.push("Invalid file entry in form data.");
        continue;
      }

      if (!isSupportedFile(entry.name)) {
        errors.push(
          `"${entry.name}" is not a supported file type.`,
        );
        continue;
      }

      try {
        const arrayBuf = await entry.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const parsed = await parseFile(buffer, entry.name);
        results.push(parsed);
      } catch (err) {
        errors.push(
          err instanceof Error ? err.message : `Failed to parse "${entry.name}".`,
        );
      }
    }

    return NextResponse.json({ files: results, errors }, { status: 200 });
  } catch (err) {
    console.error("[/api/upload]", err);
    return NextResponse.json(
      { error: "Failed to process upload." },
      { status: 500 },
    );
  }
}
