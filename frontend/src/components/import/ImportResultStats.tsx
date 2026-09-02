// frontend/src/components/import/ImportResultStats.tsx
import { CheckCircle } from "lucide-react";
import StatItem from "@/components/import/StatItem";
import type { ImportResult } from "@/types";

interface ImportResultStatsProps {
  result: ImportResult;
}

export default function ImportResultStats({ result }: ImportResultStatsProps) {
  return (
    <div className="border-t-[0.5px] border-border">
      <div className="px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success-subtle-bg">
              <CheckCircle className="h-3.5 w-3.5 text-color-income" />
            </div>
            <div>
              <h2 className="font-sans text-[12px] font-medium text-text-primary">Import Complete</h2>
              <p className="font-sans text-[9px] text-text-secondary">Statement processed successfully</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatItem label="Parsed" value={result.total_parsed} color="text-text-primary" />
          <StatItem label="Imported" value={result.imported} color="text-color-income" />
          <StatItem label="Duplicates" value={result.duplicates} color="text-text-secondary" />
          <StatItem
            label="Errors"
            value={result.errors}
            color={result.errors > 0 ? "text-accent" : "text-text-secondary"}
          />
        </div>

        {result.error_details.length > 0 && (
          <div className="mt-4 border-t-[0.5px] border-dashed border-border pt-3.5">
            <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
              Error Details
            </p>
            <ul className="space-y-1">
              {result.error_details.map((detail, index) => (
                <li key={`${detail}-${index}`} className="font-sans text-[10px] leading-relaxed text-text-secondary">
                  <span className="mr-1.5 text-accent">•</span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}