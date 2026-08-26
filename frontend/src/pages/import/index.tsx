// frontend/src/pages/ImportPage.tsx
import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, AlertCircle } from "lucide-react";

import { useAccounts } from "@/hooks";
import { importService } from "@/services";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import AccountSelector from "@/components/import/AccountSelector";
import BankDisplay from "@/components/import/BankDisplay";
import FileUploadArea from "@/components/import/FileUploadArea";
import ImportResultStats from "@/components/import/ImportResultStats";
import ImportSkeleton from "@/components/import/ImportSkeleton";
import WabiSabiFooter from "@/components/WabiSabiFooter";

import type { ImportResult } from "@/types";

export default function ImportPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const queryClient = useQueryClient();

  const [selectedAccountId, setSelectedAccountId] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [localError, setLocalError] = useState("");

  const selectedAccount = selectedAccountId === ""
    ? null
    : accounts.find((a) => a.id === selectedAccountId) ?? null;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedAccount) throw new Error("Please choose an account first");
      if (!file) throw new Error("Please choose a PDF file");
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
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error: Error) => setLocalError(error.message),
  });

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setResult(null);
    setLocalError("");
  };

  const handleFileRemove = () => {
    setFile(null);
    setResult(null);
    setLocalError("");
  };

  const handleAccountSelect = (id: number) => {
    setSelectedAccountId(id);
    setResult(null);
    setLocalError("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (isLoading) {
    return <ImportSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-2xl font-light tracking-tight text-[#1C1410]">Import</h1>
        <p className="mt-1 font-sans text-sm text-[#8B7355]">
          Upload your bank statement to import transactions
        </p>
      </div>

      {/* Import Card — no border */}
      <Card className="rounded-[4px] !ring-0  shadow-none">
        {/* CardHeader without border — removed */}
        <CardContent className="px-5 py-5 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <AccountSelector
              accounts={accounts}
              selectedAccount={selectedAccount}
              onSelect={handleAccountSelect}
              isLoading={isLoading}
            />

            <BankDisplay bank={selectedAccount?.bank ?? null} />

            <FileUploadArea
              file={file}
              onFileSelect={handleFileSelect}
              onRemove={handleFileRemove}
              error={localError}
              setError={setLocalError}
            />

            {localError && (
              <div className="flex items-start gap-2.5 rounded-[4px] border-[0.5px] border-[#C0392B]/20 bg-[#FEF8F7] px-3.5 py-3">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C0392B]" />
                <p className="font-sans text-[11px] leading-relaxed text-[#C0392B]">{localError}</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center">
              <Button
                type="submit"
                disabled={mutation.isPending || !selectedAccount || !file}
                className="h-10 w-full rounded-[4px] bg-[#C0392B] px-5 font-sans text-[12px] font-medium text-white shadow-none transition-colors hover:bg-[#A83224] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {mutation.isPending ? (
                  <>
                    <span className="mr-2 inline-block animate-spin">⟳</span>
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
                <span className="font-sans text-[10px] text-[#A6947E]">Select an account to continue</span>
              )}
              {selectedAccount && !file && (
                <span className="font-sans text-[10px] text-[#A6947E]">Choose a PDF statement to continue</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {result && <ImportResultStats result={result} />}

      <WabiSabiFooter />
    </div>
  );
}