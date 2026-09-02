// frontend/src/components/transactions/AddTransactionSheet.tsx
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Formats a raw numeric string ("1234567.5") into a display string ("1,234,567.5")
// without touching the underlying raw value used for the backend payload.
function formatDisplayAmount(raw: string): string {
    if (!raw) return "";
    const [intPart, decPart] = raw.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

// ── Reusable dropdown trigger/content classes (matches MonthSelector styling) ──
const dropdownTriggerClass =
    "flex h-auto w-full items-center justify-between border-0 border-b border-border rounded-none bg-transparent px-0 py-2 text-[13px] font-sans text-text-primary focus:border-accent focus:outline-none";
const dropdownContentClass =
    "border-[0.5px] border-border bg-surface rounded-[4px] shadow-[0_8px_24px_rgba(28,20,16,0.08)] p-1 max-h-56 overflow-y-auto";
const dropdownItemClass = (isSelected: boolean) =>
    `cursor-pointer font-sans text-[13px] px-3 py-2 rounded-[4px] transition-colors ${
        isSelected
            ? "bg-bg text-text-primary font-medium"
            : "text-text-secondary hover:bg-bg hover:text-text-primary"
    }`;

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
    const [amount, setAmount] = useState(""); // raw, backend-safe value
    const [title, setTitle] = useState("");
    const [targetAccountId, setTargetAccountId] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [date, setDate] = useState(TODAY);
    const [note, setNote] = useState("");
    const [fee, setFee] = useState(""); // raw, backend-safe value

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
        // Strip everything except digits and dots — this also strips the
        // display commas back out, so the underlying raw value stays clean.
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

    const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFee(sanitizeDecimalInput(e.target.value));
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

    const selectedAccountName = accountId
        ? accounts.find((a) => String(a.id) === accountId)?.name ?? "Select account"
        : "Select account";

    const selectedTargetAccountName = targetAccountId
        ? accounts.find((a) => String(a.id) === targetAccountId)?.name ?? "Select target account"
        : "Select target account";

    const selectedCategoryLabel = category
        ? CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? "Select category"
        : "Select category";

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
                        <DropdownMenu>
                            <DropdownMenuTrigger className={dropdownTriggerClass}>
                                <span>{currency}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className={dropdownContentClass}>
                                {["IDR", "USD"].map((c) => (
                                    <DropdownMenuItem
                                        key={c}
                                        onClick={() => setCurrency(c as "IDR" | "USD")}
                                        className={dropdownItemClass(currency === c)}
                                    >
                                        {c}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* ── Amount ── */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                            Amount ({currency})
                        </Label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            value={formatDisplayAmount(amount)}
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
                        />
                    </div>

                    {/* ── Account selector ── */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                            {type === TransactionTypeEnum.TRANSFER ? "From Account" : "Account"}
                        </Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger className={dropdownTriggerClass}>
                                <span className="truncate">{selectedAccountName}</span>
                                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className={dropdownContentClass}>
                                {accounts.map((acc) => (
                                    <DropdownMenuItem
                                        key={acc.id}
                                        onClick={() => setAccountId(String(acc.id))}
                                        className={dropdownItemClass(accountId === String(acc.id))}
                                    >
                                        {acc.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* ── Target account (only for transfers) ── */}
                    {type === TransactionTypeEnum.TRANSFER && (
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                                To Account
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger className={dropdownTriggerClass}>
                                    <span className="truncate">{selectedTargetAccountName}</span>
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className={dropdownContentClass}>
                                    {accounts
                                        .filter((a) => String(a.id) !== accountId)
                                        .map((acc) => (
                                            <DropdownMenuItem
                                                key={acc.id}
                                                onClick={() => setTargetAccountId(String(acc.id))}
                                                className={dropdownItemClass(targetAccountId === String(acc.id))}
                                            >
                                                {acc.name}
                                            </DropdownMenuItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {/* ── Category (only for non-transfer) ── */}
                    {type !== TransactionTypeEnum.TRANSFER && (
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-semibold text-text-secondary tracking-[0.12em]">
                                Category
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger className={dropdownTriggerClass}>
                                    <span>{selectedCategoryLabel}</span>
                                    <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className={dropdownContentClass}>
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <DropdownMenuItem
                                            key={cat.value}
                                            onClick={() => setCategory(cat.value)}
                                            className={dropdownItemClass(category === cat.value)}
                                        >
                                            {cat.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                                value={formatDisplayAmount(fee)}
                                onChange={handleFeeChange}
                                placeholder="0"
                                className="h-auto text-center font-mono text-base sm:text-2xl font-normal bg-transparent border-0 border-b border-border rounded-none px-0 py-2 focus:border-accent [&:focus]:ring-0 [&:focus]:ring-offset-0 [&:focus]:outline-none"
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