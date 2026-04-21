"use client";

import { useRef, useState } from "react";
import { Upload, X, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExistingFile {
  fileName: string;
  fileSize: number;
}

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  existingFiles?: ExistingFile[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function FileUpload({ onFilesChange, existingFiles = [] }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const newFiles = [...files, ...Array.from(incoming)];
    setFiles(newFiles);
    onFilesChange(newFiles);
  }

  function removeFile(index: number) {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 cursor-pointer transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <Upload className={cn("h-8 w-8 transition-colors", dragOver ? "text-primary" : "text-muted-foreground")} />
        <div className="text-center">
          <p className="text-sm font-medium">
            {dragOver ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* Existing files (already saved) */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Existing files</p>
          {existingFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
            >
              <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{f.fileName}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(f.fileSize)}</span>
            </div>
          ))}
        </div>
      )}

      {/* New files to upload */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New files</p>
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
            >
              <File className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(f.size)}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="shrink-0 rounded p-0.5 hover:bg-accent transition-colors"
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
