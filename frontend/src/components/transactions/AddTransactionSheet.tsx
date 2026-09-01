// frontend/src/components/transactions/AddTransactionSheet.tsx
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { transactionService } from "@/services";
import { useAccounts } from "@/hooks";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { CATEGORY_LABELS } from "@/lib/constants";
import { TransactionTypeEnum, CurrencyEnum, CategoryEnum } from "@/types";
import type { Transaction } from "@/types";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddTransactionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// ── Helpers ──────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split("T")[0];

const TYPE_OPTIONS = [
    { value: TransactionTypeEnum.EXPENSE, label: "Expense" },
    { value: TransactionTypeEnum.INCOME, label: "Income" },
    { value: TransactionTypeEnum.TRANSFER, label: "Transfer" },
];

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS)
    .map(([key, label]) => ({ value: key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

type TransactionType = Transaction["type"];

// ── Component ────────────────────────────────────────────────────
export default function AddTransactionSheet({
    open,
    onOpenChange,
}: AddTransactionSheetProps) {
    
    const [accountId, setAccountId] = useState<string>("");

    const queryClient = useQueryClient();
    const { data: accounts = [] } = useAccounts();
    const { currency: activeCurrency, rate } = useCurrency();
    const { data: exchangeRateData } = useExchangeRate();
    const selectedAccount = accounts.find((acc) => String(acc.id) === accountId);

    // ── Form state ─────────────────────────────────────────────────
    const [type, setType] = useState<TransactionType>(
        TransactionTypeEnum.EXPENSE
    );
    const [currency, setCurrency] = useState<"IDR" | "USD">(
        activeCurrency === "USD" ? "USD" : "IDR"
    );
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [targetAccountId, setTargetAccountId] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [date, setDate] = useState(TODAY);
    const [note, setNote] = useState("");
    const [fee, setFee] = useState("");

    // ── Auto-select first account ─────────────────────────────────
    useEffect(() => {
        if (accounts.length > 0 && !accountId) {
            setAccountId(String(accounts[0].id));
        }
    }, [accounts]);

    useEffect(() => {
        if (selectedAccount) {
            setCurrency(selectedAccount.currency === "USD" ? "USD" : "IDR");
            return;
        }

        setCurrency(activeCurrency === "USD" ? "USD" : "IDR");
    }, [selectedAccount, activeCurrency]);

    // ── Mutations ──────────────────────────────────────────────────
    const createTx = useMutation({
        mutationFn: transactionService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            resetForm();
            onOpenChange(false);
            toast.success("Transaction created successfully");
        },
        onError: (error) => {
            console.error("Failed to create transaction:", error);
            toast.error(error?.message || "Failed to create transaction");
        },
    });

    const createTransfer = useMutation({
        mutationFn: transactionService.createTransfer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            resetForm();
            onOpenChange(false);
            toast.success("Transfer created successfully");
        },
        onError: (error) => {
            console.error("Failed to create transfer:", error);
            toast.error(error?.message || "Failed to create transfer");
        },
    });

    // ── Helpers ──────────────────────────────────────────────────
    const resetForm = () => {
        setType(TransactionTypeEnum.EXPENSE);
        setAmount("");
        setTitle("");
        setAccountId(accounts[0]?.id?.toString() || "");
        setTargetAccountId("");
        setCategory("");
        setDate(TODAY);
        setNote("");
        setFee("");
    };

    const sanitizeDecimalInput = (val: string) => {
        const cleaned = val.replace(/[^\d.]/g, "");
        if (!cleaned) return "";
        const parts = cleaned.split(".");
        if (parts.length > 2) {
            return `${parts[0]}.${parts.slice(1).join("")}`;
        }
        return cleaned;
    };

    const parseAmount = (val: string) => {
        const cleaned = sanitizeDecimalInput(val);
        if (!cleaned) return 0;
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(sanitizeDecimalInput(e.target.value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const parsedAmount = parseAmount(amount);
        if (!parsedAmount || parsedAmount <= 0) return;
        if (!accountId) return;

        if (type === TransactionTypeEnum.TRANSFER) {
            if (!targetAccountId) return;

            const fromAccount = accounts.find((acc) => String(acc.id) === accountId);
            const toAccount = accounts.find((acc) => String(acc.id) === targetAccountId);
            const sourceCurrency = fromAccount?.currency ?? (currency === "USD" ? CurrencyEnum.USD : CurrencyEnum.IDR);
            const destinationCurrency = toAccount?.currency ?? sourceCurrency;
            const transferRate = exchangeRateData?.rate ?? rate ?? 1;

            const fromAmount = String(parsedAmount);
            const toAmount =
                sourceCurrency === destinationCurrency
                    ? fromAmount
                    : sourceCurrency === CurrencyEnum.USD && destinationCurrency === CurrencyEnum.IDR
                        ? String(parsedAmount * transferRate)
                        : sourceCurrency === CurrencyEnum.IDR && destinationCurrency === CurrencyEnum.USD
                            ? String(parsedAmount / transferRate)
                            : fromAmount;

            createTransfer.mutate({
                from_account_id: Number(accountId),
                to_account_id: Number(targetAccountId),
                date,
                amount: fromAmount,
                note: note || title || undefined,
                fee: String(parseAmount(fee)),
                from_currency: sourceCurrency,
                to_currency: destinationCurrency,
                from_amount: fromAmount,
                to_amount: toAmount,
                rate_applied: String(transferRate),
            });
        } else {
            createTx.mutate({
                account_id: Number(accountId),
                date,
                amount: String(parsedAmount),
                type,
                category: (category || "OTHER") as typeof CategoryEnum[keyof typeof CategoryEnum],
                note: note || title || undefined,
                source: "MANUAL",
                currency: currency === "USD" ? CurrencyEnum.USD : CurrencyEnum.IDR,
                original_amount: null,
                original_currency: null,
            });
        }
    };

    const isSubmitting =
        createTx.isPending || createTransfer.isPending;

    // ── Render ────────────────────────────────────────────────────
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="h-[90vh] max-h-[90vh] rounded-t-[8px] px-4 py-6 pb-8 bg-surface border-border flex flex-col overflow-y-auto"
            >
                <SheetHeader className="mb-4">
                    <SheetTitle className="font-serif text-xl font-light text-text-primary">
                        New Transaction
                    </SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5">
                    {/* ── Type selector ── */}
                    <div className="grid grid-cols-3 gap-0 border-[0.5px] border-border rounded-[4px] bg-bg p-0.5">
                        {TYPE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setType(opt.value)}
                                className={`py-2 text-[12px] font-sans font-medium rounded-[3px] transition-colors ${type === opt.value
                                    ? "bg-accent text-white"
                                    : "text-text-secondary hover:text-text-primary"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Currency ── */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                            Currency
                        </Label>
                        <Select value={currency} onValueChange={(value) => setCurrency(value === "USD" ? "USD" : "IDR")}>
                            <SelectTrigger className="h-auto border-0 border-b border-border rounded-none bg-transparent px-0 py-2 shadow-none focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-surface">
                                <SelectItem value="IDR">IDR</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ── Amount ── */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                            Amount ({currency})
                        </Label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0"
                            className="h-auto text-center font-mono text-base sm:text-2xl font-normal bg-transparent border-0 border-b border-border rounded-none px-0 py-2 focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* ── Description ── */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                            Description
                        </Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Lunch, Salary, etc."
                            className="h-auto text-center font-mono text-base sm:text-2xl font-normal bg-transparent border-0 border-b border-border rounded-none px-0 py-2 focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* ── Account selector ── */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                            {type === TransactionTypeEnum.TRANSFER ? "From Account" : "Account"}
                        </Label>
                        <Select
                            value={accountId}
                            onValueChange={(val) => setAccountId(val || "")}
                        >
                            <SelectTrigger className="h-auto border-0 border-b border-border rounded-none bg-transparent px-0 py-2 shadow-none focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none">
                                {accountId ? accounts.find(a => String(a.id) === accountId)?.name || "Select account" : "Select account"}
                            </SelectTrigger>
                            <SelectContent className="border-border bg-surface">
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={String(acc.id)}>
                                        {acc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ── Target account (only for transfers) ── */}
                    {type === TransactionTypeEnum.TRANSFER && (
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                                To Account
                            </Label>
                            <Select
                                value={targetAccountId}
                                onValueChange={(val) => setTargetAccountId(val || "")}
                            >
                                <SelectTrigger className="h-auto border-0 border-b border-border rounded-none bg-transparent px-0 py-2 shadow-none focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none">
                                    {targetAccountId ? accounts.find(a => String(a.id) === targetAccountId)?.name || "Select target account" : "Select target account"}
                                </SelectTrigger>
                                <SelectContent className="border-border bg-surface">
                                    {accounts
                                        .filter((a) => String(a.id) !== accountId)
                                        .map((acc) => (
                                            <SelectItem key={acc.id} value={String(acc.id)}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* ── Category (only for non-transfer) ── */}
                    {type !== TransactionTypeEnum.TRANSFER && (
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                                Category
                            </Label>
                            <Select
                                value={category}
                                onValueChange={(val) => setCategory(val || "")}
                            >
                                <SelectTrigger className="h-auto border-0 border-b border-border rounded-none bg-transparent px-0 py-2 shadow-none focus:border-accent focus:ring-0 focus:ring-offset-0 focus:outline-none">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-surface max-h-56 overflow-y-auto">
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* ── Date ── */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                            Date
                        </Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-auto text-center font-mono text-base sm:text-2xl font-normal bg-transparent border-0 border-b border-border rounded-none px-0 py-2 focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* ── Note ── */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                            Note <span className="font-normal text-text-muted">(optional)</span>
                        </Label>
                        <Input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g., QRIS / Reference"
                            className="h-auto text-center font-mono text-base sm:text-2xl font-normal bg-transparent border-0 border-b border-border rounded-none px-0 py-2 focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* ── Transfer fee ── */}
                    {type === TransactionTypeEnum.TRANSFER && (
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                                Transfer Fee <span className="font-normal text-text-muted">(optional)</span>
                            </Label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={fee}
                                onChange={(e) => {
                                    setFee(sanitizeDecimalInput(e.target.value));
                                }}
                                placeholder="0"
                                className="h-auto text-center font-mono text-base sm:text-2xl font-normal bg-transparent border-0 border-b border-border rounded-none px-0 py-2 focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* ── Submit ── */}
                    <div className="mt-auto pt-4 border-t-[0.5px] border-dashed border-border">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !accountId || parseAmount(amount) === 0}
                            className="w-full bg-accent text-white hover:bg-accent-hover rounded-[4px] py-3 text-sm font-medium"
                        >
                            {isSubmitting
                                ? "Saving..."
                                : type === TransactionTypeEnum.TRANSFER
                                    ? "Create Transfer"
                                    : "Save Transaction"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}