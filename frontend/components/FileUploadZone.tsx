"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UploadedFile {
  name: string;
  text: string;
  size: number;
}

interface Props {
  disabled: boolean;
  onFilesReady: (combinedText: string) => void;
}

const ACCEPTED = ".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls,.pptx,.ppt";

const FILE_ICONS: Record<string, string> = {
  pdf: "\u{1F4D5}",
  docx: "\u{1F4DD}",
  doc: "\u{1F4DD}",
  txt: "\u{1F4C4}",
  csv: "\u{1F4CA}",
  xlsx: "\u{1F4CA}",
  xls: "\u{1F4CA}",
  pptx: "\u{1F4FA}",
  ppt: "\u{1F4FA}",
};

function ext(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FileUploadZone({ disabled, onFilesReady }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  useEffect(() => {
    const combined = files.map((f) => f.text).join("\n\n---\n\n");
    onFilesReady(combined);
  }, [files, onFilesReady]);

  const upload = useCallback(async (fileList: FileList | File[]) => {
    setUploading(true);
    setUploadErrors([]);

    const formData = new FormData();
    for (const f of fileList) {
      formData.append("files", f);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadErrors([data.error ?? "Upload failed."]);
        return;
      }

      const parsed: UploadedFile[] = data.files ?? [];
      const errs: string[] = data.errors ?? [];

      setFiles((prev) => [...prev, ...parsed]);

      if (errs.length > 0) {
        setUploadErrors(errs);
      }
    } catch {
      setUploadErrors(["Network error during upload."]);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        upload(e.target.files);
      }
      e.target.value = "";
    },
    [upload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled || uploading) return;
      if (e.dataTransfer.files.length > 0) {
        upload(e.dataTransfer.files);
      }
    },
    [disabled, uploading, upload],
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [],
  );

  const zoneClasses = [
    "upload-zone",
    dragOver ? "drag-over" : "",
    disabled || uploading ? "disabled" : "",
  ].filter(Boolean).join(" ");

  return (
    <div>
      <div
        className={zoneClasses}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled && !uploading) inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          onChange={handleInputChange}
          style={{ display: "none" }}
        />

        <div style={{ fontSize: "clamp(32px, 6vw, 40px)", marginBottom: 8, lineHeight: 1 }}>
          {uploading ? "\u{23F3}" : "\u{1F4C1}"}
        </div>

        <p style={{
          fontFamily: "var(--font-hand)",
          fontSize: "clamp(17px, 3.5vw, 20px)",
          color: "var(--ink)",
          margin: "0 0 4px",
        }}>
          {uploading
            ? "Reading your files..."
            : "Drop files here or tap to browse"}
        </p>

        <p style={{ fontSize: 13, color: "var(--pencil)" }}>
          PDF, Word, Excel, CSV, PowerPoint, Text — up to 20 MB each
        </p>
      </div>

      {uploadErrors.length > 0 && (
        <div style={{
          marginTop: 10,
          padding: "10px 14px",
          borderRadius: 10,
          background: "var(--coral-light)",
          border: "2px solid var(--coral)",
          fontSize: 14,
        }}>
          {uploadErrors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="file-item animate-in"
            >
              <span style={{ fontSize: 18 }}>{FILE_ICONS[ext(f.name)] ?? "\u{1F4C4}"}</span>
              <span className="file-item-name">{f.name}</span>
              <span className="file-item-meta">
                {humanSize(f.size)} &middot; {f.text.length.toLocaleString()} ch
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                disabled={disabled}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  padding: "4px 8px",
                  borderRadius: 6,
                  color: "var(--coral)",
                  minWidth: 32,
                  minHeight: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Remove file"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
