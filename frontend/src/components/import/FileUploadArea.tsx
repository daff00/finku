// frontend/src/components/import/FileUploadArea.tsx
import { useRef } from "react";
import { Upload, FileText, X } from "lucide-react";

interface FileUploadAreaProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
  error: string;
  setError: (error: string) => void;
}

export default function FileUploadArea({
  file,
  onFileSelect,
  onRemove,
  setError,
}: FileUploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;

    if (selectedFile && selectedFile.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      if (e.target) e.target.value = "";
      return;
    }

    onFileSelect(selectedFile);
    setError("");
  };

  return (
    <div className="space-y-1.5">
      <label className="block font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
        Statement File
      </label>

      {!file ? (
        <button
          type="button"
          onClick={handleClick}
          className="group flex w-full flex-col items-center justify-center rounded-[4px] border-[0.5px] border-dashed border-border-subtle bg-bg px-5 py-8 text-center transition-colors hover:border-border-strong hover:bg-surface-hover"
        >
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[3px] border-[0.5px] border-border bg-white transition-colors group-hover:border-border-strong">
            <Upload className="h-4 w-4 text-text-secondary" />
          </div>
          <span className="font-sans text-[12px] font-medium text-text-primary">Choose PDF statement</span>
          <span className="mt-1 font-sans text-[10px] text-text-hint">PDF files only</span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-[4px] border-[0.5px] border-success-subtle-border bg-success-subtle-bg px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-white">
              <FileText className="h-4 w-4 text-color-income" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-sans text-[11px] font-medium text-text-primary">{file.name}</p>
              <p className="mt-0.5 font-sans text-[9px] text-text-secondary">PDF statement · Ready to import</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-[3px] p-1.5 text-text-hint transition-colors hover:bg-white hover:text-accent"
            title="Remove file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}