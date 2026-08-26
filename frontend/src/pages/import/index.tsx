import { useEffect, useRef, useState, type FormEvent } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  FileUp,
  X,
  ChevronDown,
} from "lucide-react";

import { useAccounts } from "@/hooks";
import { importService } from "@/services";
import { BANK_LABELS } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import WabiSabiFooter from "@/components/WabiSabiFooter";

import type { ImportResult } from "@/types";

export default function ImportPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAccountId, setSelectedAccountId] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (selectedAccountId === "" && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount =
    selectedAccountId === ""
      ? null
      : accounts.find((account) => account.id === selectedAccountId) ?? null;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedAccount) {
        throw new Error("Please choose an account first");
      }

      if (!file) {
        throw new Error("Please choose a PDF file");
      }

      return importService.importStatement({
        accountId: selectedAccount.id,
        bank: selectedAccount.bank,
        file,
      });
    },

    onSuccess: async (data) => {
      setResult(data);
      setLocalError("");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["analytics"],
      });
    },

    onError: (error: Error) => {
      setLocalError(error.message);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (selectedFile && selectedFile.type !== "application/pdf") {
      setLocalError("Please upload a valid PDF file.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setFile(selectedFile);
    setResult(null);
    setLocalError("");
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setLocalError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header ───────────────────────────────────────── */}

      <div>
        <h1 className="font-playfair text-[24px] font-normal tracking-tight text-[#1C1410]">
          Import
        </h1>

        <p className="mt-1 font-inter text-[12px] text-[#8B7355]">
          Upload your bank statement to import transactions
        </p>
      </div>

      {/* ── Import Card ───────────────────────────────────────── */}

      <div className="w-full">
        <div className="w-full rounded-[4px] border-[0.5px] border-[#E8E4DE] bg-white">
          <form onSubmit={handleSubmit}>
            {/* ── Form Header ─────────────────────────────── */}

            <div className="border-b-[0.5px] border-dashed border-[#E8E4DE] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-[#FAFAF8]">
                  <FileUp className="h-4 w-4 text-[#8B7355]" />
                </div>

                <div>
                  <h2 className="font-inter text-[13px] font-medium text-[#1C1410]">
                    Bank Statement
                  </h2>

                  <p className="mt-0.5 font-inter text-[10px] text-[#8B7355]">
                    Select an account and upload your PDF statement
                  </p>
                </div>
              </div>
            </div>

            {/* ── Form Body ───────────────────────────────── */}

            <div className="space-y-5 px-5 py-5 sm:px-6">
              {/* Account */}

              <div className="space-y-1.5">
                <label className="block font-inter text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B7355]">
                  Target Account
                </label>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="outline"
                      className="
          w-full justify-between
          h-10 rounded-[4px]
          border-[0.5px] border-[#E8E4DE]
          bg-white
          px-3
          font-inter text-[12px] text-[#1C1410]
          hover:bg-[#FAFAF8]
          focus:border-[#1C1410]
          focus:ring-0
        "
                      disabled={isLoading || accounts.length === 0}
                    >
                      <span className="truncate">
                        {selectedAccount
                          ? `${selectedAccount.name} · ${BANK_LABELS[selectedAccount.bank] ?? selectedAccount.bank}`
                          : isLoading
                            ? "Loading accounts..."
                            : "Select an account"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="
        w-[var(--radix-dropdown-menu-trigger-width)]
        rounded-[4px] border-[0.5px] border-[#E8E4DE]
        bg-white
        shadow-[0_8px_24px_rgba(28,20,16,0.08)]
        p-1
      "
                  >
                    {accounts.length === 0 ? (
                      <div className="px-2 py-1.5 text-[12px] text-[#8B7355] font-inter">
                        No accounts available
                      </div>
                    ) : (
                      accounts.map((account) => (
                        <DropdownMenuItem
                          key={account.id}
                          onClick={() => {
                            setSelectedAccountId(account.id);
                            setResult(null);
                            setLocalError("");
                          }}
                          className="
                            cursor-pointer
                            rounded-[4px]
                            px-2 py-1.5
                            font-inter text-[12px] text-[#1C1410]
                            hover:bg-[#FAFAF8]
                            focus:bg-[#FAFAF8]
                          "
                        >
                          {account.name} · {BANK_LABELS[account.bank] ?? account.bank}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Bank */}

              <div className="space-y-1.5">
                <label className="block font-inter text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B7355]">
                  Bank
                </label>

                <div className="flex min-h-10 items-center rounded-[4px] border-[0.5px] border-[#E8E4DE] bg-[#FAFAF8] px-3 font-inter text-[12px] text-[#1C1410]">
                  {selectedAccount
                    ? BANK_LABELS[selectedAccount.bank] ??
                    selectedAccount.bank
                    : "Select an account"}
                </div>
              </div>

              {/* ── File Upload ───────────────────────────── */}

              <div className="space-y-1.5">
                <label className="block font-inter text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B7355]">
                  Statement File
                </label>

                {!file ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="
                      group
                      flex w-full flex-col items-center justify-center
                      rounded-[4px]
                      border-[0.5px] border-dashed border-[#D8D1C8]
                      bg-[#FAFAF8]
                      px-5 py-8
                      text-center
                      transition-colors
                      hover:border-[#C4B5A0]
                      hover:bg-[#F7F5F1]
                    "
                  >
                    <div
                      className="
                        mb-3 flex h-9 w-9 items-center justify-center
                        rounded-[3px]
                        border-[0.5px] border-[#E8E4DE]
                        bg-white
                        transition-colors
                        group-hover:border-[#C4B5A0]
                      "
                    >
                      <Upload className="h-4 w-4 text-[#8B7355]" />
                    </div>

                    <span className="font-inter text-[12px] font-medium text-[#1C1410]">
                      Choose PDF statement
                    </span>

                    <span className="mt-1 font-inter text-[10px] text-[#A6947E]">
                      PDF files only
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-[4px] border-[0.5px] border-[#D8E8DC] bg-[#F6FAF7] px-3.5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-white">
                        <FileText className="h-4 w-4 text-[#27AE60]" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-inter text-[11px] font-medium text-[#1C1410]">
                          {file.name}
                        </p>

                        <p className="mt-0.5 font-inter text-[9px] text-[#8B7355]">
                          PDF statement · Ready to import
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="shrink-0 rounded-[3px] p-1.5 text-[#A6947E] transition-colors hover:bg-white hover:text-[#C0392B]"
                      title="Remove file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* ── Error ────────────────────────────────── */}

              {localError && (
                <div className="flex items-start gap-2.5 rounded-[4px] border-[0.5px] border-[#C0392B]/20 bg-[#FEF8F7] px-3.5 py-3">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C0392B]" />

                  <p className="font-inter text-[11px] leading-relaxed text-[#C0392B]">
                    {localError}
                  </p>
                </div>
              )}

              {/* ── Submit ───────────────────────────────── */}

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  disabled={
                    mutation.isPending ||
                    !selectedAccount ||
                    !file
                  }
                  className="
                    h-10 w-full
                    rounded-[4px]
                    bg-[#C0392B]
                    px-5
                    font-inter text-[12px] font-medium text-white
                    shadow-none
                    transition-colors
                    hover:bg-[#A83224]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    sm:w-auto
                  "
                >
                  {mutation.isPending ? (
                    <>
                      <span className="mr-2 inline-block animate-spin">
                        ⟳
                      </span>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      Import Statement
                    </>
                  )}
                </Button>

                {!selectedAccount && !isLoading && (
                  <span className="font-inter text-[10px] text-[#A6947E]">
                    Select an account to continue
                  </span>
                )}

                {selectedAccount && !file && (
                  <span className="font-inter text-[10px] text-[#A6947E]">
                    Choose a PDF statement to continue
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* ── Import Result ──────────────────────────────── */}

          {result && (
            <div className="border-t-[0.5px] border-[#E8E4DE]">
              <div className="px-5 py-5 sm:px-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F9F4]">
                      <CheckCircle className="h-3.5 w-3.5 text-[#27AE60]" />
                    </div>

                    <div>
                      <h2 className="font-inter text-[12px] font-medium text-[#1C1410]">
                        Import Complete
                      </h2>

                      <p className="font-inter text-[9px] text-[#8B7355]">
                        Statement processed successfully
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatItem
                    label="Parsed"
                    value={result.total_parsed}
                    color="text-[#1C1410]"
                  />

                  <StatItem
                    label="Imported"
                    value={result.imported}
                    color="text-[#27AE60]"
                  />

                  <StatItem
                    label="Duplicates"
                    value={result.duplicates}
                    color="text-[#8B7355]"
                  />

                  <StatItem
                    label="Errors"
                    value={result.errors}
                    color={
                      result.errors > 0
                        ? "text-[#C0392B]"
                        : "text-[#8B7355]"
                    }
                  />
                </div>

                {result.error_details.length > 0 && (
                  <div className="mt-4 border-t-[0.5px] border-dashed border-[#E8E4DE] pt-3.5">
                    <p className="mb-2 font-inter text-[10px] font-semibold uppercase tracking-[0.1em] text-[#C0392B]">
                      Error Details
                    </p>

                    <ul className="space-y-1">
                      {result.error_details.map((detail, index) => (
                        <li
                          key={`${detail}-${index}`}
                          className="font-inter text-[10px] leading-relaxed text-[#8B7355]"
                        >
                          <span className="mr-1.5 text-[#C0392B]">
                            •
                          </span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <WabiSabiFooter />
    </div>
  );
}

/* ── Stat Item ─────────────────────────────────────────────────── */

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="
        min-w-0
        rounded-[4px]
        border-[0.5px] border-[#E8E4DE]
        bg-[#FAFAF8]
        px-2 py-3
        text-center
      "
    >
      <p className="truncate font-inter text-[8px] font-medium uppercase tracking-[0.1em] text-[#8B7355]">
        {label}
      </p>

      <p
        className={`
          mt-1
          truncate
          font-mono
          text-[16px]
          font-medium
          leading-none
          ${color}
        `}
      >
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}