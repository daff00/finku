import { useEffect, useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useAccounts } from "@/hooks"
import { importService } from "@/services"
import { BANK_LABELS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import type { ImportResult } from "@/types"

export default function ImportPage() {
  const { data: accounts = [], isLoading } = useAccounts()
  const queryClient = useQueryClient()
  const [selectedAccountId, setSelectedAccountId] = useState<number | "">("")
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [localError, setLocalError] = useState("")

  useEffect(() => {
    if (selectedAccountId === "" && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id)
    }
  }, [accounts, selectedAccountId])

  const selectedAccount =
    selectedAccountId === ""
      ? null
      : accounts.find((account) => account.id === selectedAccountId) ?? null

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedAccount) {
        throw new Error("Please choose an account first")
      }
      if (!file) {
        throw new Error("Please choose a PDF file")
      }

      return importService.importStatement({
        accountId: selectedAccount.id,
        bank: selectedAccount.bank,
        file,
      })
    },
    onSuccess: async (data) => {
      setResult(data)
      setLocalError("")
      setFile(null)
      await queryClient.invalidateQueries({ queryKey: ["transactions"] })
      await queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
    onError: (error: Error) => {
      setLocalError(error.message)
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Import
        </p>
        <h1 className="text-3xl font-semibold">Bank statement import</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Upload a supported bank statement, pick the account it belongs to,
          and let the backend parse and save the transactions.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border p-5 shadow-sm"
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium">Target account</span>
          <select
            className="rounded-md border bg-background px-3 py-2"
            value={selectedAccountId}
            onChange={(event) => {
              const value = event.target.value
              setSelectedAccountId(value === "" ? "" : Number(value))
              setResult(null)
              setLocalError("")
            }}
            disabled={isLoading || accounts.length === 0}
          >
            {accounts.length === 0 ? (
              <option value="">No accounts available</option>
            ) : (
              accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {BANK_LABELS[account.bank] ?? account.bank}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Bank</span>
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {selectedAccount
              ? BANK_LABELS[selectedAccount.bank] ?? selectedAccount.bank
              : "Select an account"}
          </div>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Statement file</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="block w-full rounded-md border border-dashed px-3 py-2 text-sm"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null)
              setResult(null)
              setLocalError("")
            }}
          />
        </label>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={mutation.isPending || !selectedAccount || !file}
          >
            {mutation.isPending ? "Importing..." : "Import statement"}
          </Button>
          {file ? (
            <span className="text-sm text-muted-foreground">{file.name}</span>
          ) : null}
        </div>

        {localError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {localError}
          </div>
        ) : null}
      </form>

      {result ? (
        <section className="grid gap-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Import result</h2>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <div>Total parsed: {result.total_parsed}</div>
            <div>Imported: {result.imported}</div>
            <div>Duplicates: {result.duplicates}</div>
            <div>Errors: {result.errors}</div>
          </div>
          {result.error_details.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Error details</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.error_details.map((detail, index) => (
                  <li key={`${detail}-${index}`}>{detail}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
