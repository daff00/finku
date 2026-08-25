import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";

import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { formatDate, formatIDR } from "@/lib/formatters";
import { CATEGORY_LABELS } from "@/lib/constants";
import { TransactionTypeEnum } from "@/types";
import type { Transaction } from "@/types";

// ── ShadCN Imports ──────────────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const TYPE_FILTERS = [
  { label: "All", value: undefined },
  { label: "Expense", value: TransactionTypeEnum.EXPENSE },
  { label: "Income", value: TransactionTypeEnum.INCOME },
  { label: "Transfer", value: TransactionTypeEnum.TRANSFER },
] as const;

type TransactionFilter = Transaction["type"] | undefined;

type AccountInfo = {
  name: string;
  bank: string;
  color: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function groupByDate(
  transactions: Transaction[],
): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>(
    (groups, transaction) => {
      const { date } = transaction;
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    },
    {},
  );
}

function getTransactionAmountStyle(type: Transaction["type"]) {
  switch (type) {
    case TransactionTypeEnum.INCOME:
      return { color: "#27AE60", prefix: "+" };
    case TransactionTypeEnum.EXPENSE:
      return { color: "#C0392B", prefix: "-" };
    case TransactionTypeEnum.TRANSFER:
      return { color: "#8B7355", prefix: "↔ " };
    default:
      return { color: "#1C1410", prefix: "" };
  }
}

// ── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({
  tx,
  account,
}: {
  tx: Transaction;
  account?: AccountInfo;
}) {
  const bankColor = account?.color ?? "#8B7355";
  const categoryLabel = CATEGORY_LABELS[tx.category] ?? tx.category;
  const { color: amountColor, prefix: amountPrefix } =
    getTransactionAmountStyle(tx.type);

  return (
    <div className="flex items-center justify-between border-b-[0.5px] border-dashed border-[#E8E4DE] py-[14px]">
      <div className="flex min-w-0 items-start gap-3 pr-2">
        <div
          className="mt-[7px] h-[4px] w-[4px] shrink-0 rounded-full"
          style={{ backgroundColor: bankColor }}
          title={account?.bank ?? ""}
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-sans text-[14px] font-normal leading-tight text-[#1C1410]">
            {tx.note || categoryLabel}
          </span>
          <div className="mt-1 flex items-center gap-2">
            {account && (
              <span className="font-sans text-[10px] text-[#8B7355]">
                {account.bank || account.name}
              </span>
            )}
            {categoryLabel && (
              <span className="hidden font-sans text-[10px] text-[#C4B5A0] sm:inline">
                • {categoryLabel}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className="font-mono text-[14px] font-medium"
          style={{ color: amountColor }}
        >
          {amountPrefix}
          {formatIDR(tx.amount)}
        </div>
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <span className="font-mono text-5xl text-[#C4B5A0]/30">録</span>
      <p className="mt-3 text-center font-sans text-[13px] text-[#C4B5A0]">
        No matching transactions
      </p>
    </div>
  );
}

// ── Loading State ────────────────────────────────────────────────────────────

function TransactionSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between border-b-[0.5px] border-dashed border-[#E8E4DE] py-[14px]"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-[7px] h-[4px] w-[4px] rounded-full bg-[#E8E4DE]" />
            <div className="space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-[#E8E4DE]/60" />
              <div className="h-2.5 w-44 animate-pulse rounded bg-[#E8E4DE]/40" />
            </div>
          </div>
          <div className="h-3.5 w-20 animate-pulse rounded bg-[#E8E4DE]/60" />
        </div>
      ))}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t-[0.5px] border-[#E8E4DE] pt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-[#8B7355] hover:text-[#1C1410]"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Previous
      </Button>

      <span className="text-[12px] text-[#C4B5A0] font-sans">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-[#8B7355] hover:text-[#1C1410]"
      >
        Next
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Month Selector (like Analytics) ─────────────────────────────────────────

function MonthSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const monthOptions = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return months;
  }, []);

  const currentIndex = monthOptions.findIndex((m) => m.value === value);
  const currentLabel =
    monthOptions[currentIndex]?.label ?? formatMonthLabel(value);

  const goPrev = () => {
    if (currentIndex < monthOptions.length - 1) {
      onChange(monthOptions[currentIndex + 1].value);
    }
  };

  const goNext = () => {
    if (currentIndex > 0) {
      onChange(monthOptions[currentIndex - 1].value);
    }
  };

  return (
    <div className="flex items-center gap-1 justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={goPrev}
        disabled={currentIndex >= monthOptions.length - 1}
        className="h-8 w-8 text-[#8B7355] hover:text-[#1C1410] disabled:opacity-40"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            className="flex items-center gap-1.5 px-2 text-[13px] font-medium text-[#1C1410] hover:text-[#C0392B]"
          >
            <span>{currentLabel}</span>
            <ChevronLeft className="h-4 w-4 rotate-[-90deg] text-[#8B7355]" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="center"
          sideOffset={6}
          className="z-50 w-56 max-h-64 overflow-y-auto rounded-[4px] border border-[#E8E4DE] bg-white p-1 text-[#1C1410] shadow-xl opacity-100"
        >
          {monthOptions.map((month) => (
            <DropdownMenuItem
              key={month.value}
              onClick={() => onChange(month.value)}
              className={`cursor-pointer rounded-[4px] px-3 py-2 text-[13px] transition-colors focus:bg-[#FAFAF8] ${
                month.value === value
                  ? "bg-[#FAFAF8] font-medium text-[#1C1410]"
                  : "text-[#8B7355] hover:bg-[#FAFAF8] hover:text-[#1C1410]"
              }`}
            >
              {month.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        onClick={goNext}
        disabled={currentIndex <= 0}
        className="h-8 w-8 text-[#8B7355] hover:text-[#1C1410] disabled:opacity-40"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [type, setType] = useState<TransactionFilter>();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data: transactions = [], isLoading } = useTransactions({
    month,
    type: undefined,
    limit: 100,
    offset: 0,
  });

  const { data: accounts = [] } = useAccounts();

  const accountMap = useMemo<Record<number, AccountInfo>>(
    () =>
      Object.fromEntries(
        accounts.map((account) => [
          account.id,
          {
            name: account.name,
            bank: account.bank,
            color: account.color,
          },
        ]),
      ),
    [accounts],
  );

  const bankOptions = useMemo(() => {
    const banks = accounts.map((account) => account.bank).filter(Boolean);
    return [...new Set(banks)].sort((a, b) => a.localeCompare(b));
  }, [accounts]);

  // ── Filter + group transactions ─────────────────────────────────────────

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions.filter((tx) => {
      if (type && tx.type !== type) return false;
      const account = accountMap[tx.account_id];
      if (selectedBank && account?.bank !== selectedBank) return false;
      if (!query) return true;

      const title = tx.note?.toLowerCase() ?? "";
      const category =
        CATEGORY_LABELS[tx.category]?.toLowerCase() ??
        tx.category?.toLowerCase() ??
        "";
      const accountName = account?.name?.toLowerCase() ?? "";
      const bankName = account?.bank?.toLowerCase() ?? "";

      return (
        title.includes(query) ||
        category.includes(query) ||
        accountName.includes(query) ||
        bankName.includes(query)
      );
    });
  }, [transactions, type, selectedBank, searchQuery, accountMap]);

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const handleFilterChange = (newType: TransactionFilter) => {
    setType(newType);
    setPage(1);
  };

  const handleBankChange = (bank: string | null) => {
    setSelectedBank(bank);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    setPage(1);
  };

  // ── Group by date ─────────────────────────────────────────────────────────

  const grouped = useMemo(() => {
    const groupedByDate = groupByDate(paginatedTransactions);
    return Object.keys(groupedByDate)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        transactions: groupedByDate[date],
      }));
  }, [paginatedTransactions]);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-12">
      {/* Page title */}
      <div>
        <h1 className="font-playfair text-[24px] text-[#1C1410]">
          Transactions
        </h1>
        <p className="mt-1 font-inter text-[12px] text-[#8B7355]">
          List of your transactions
        </p>
      </div>

      {/* Month selector (ShadCN Dropdown + Buttons) */}
      <MonthSelector value={month} onChange={handleMonthChange} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#C4B5A0]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search transactions, accounts, or categories..."
          className="
            w-full rounded-[4px] border-[0.5px] border-[#E8E4DE] bg-white
            py-2 pl-9 pr-3 font-sans text-[13px] text-[#1C1410]
            outline-none placeholder:text-[#C4B5A0] focus:border-[#1C1410]
          "
        />
      </div>

      {/* Filters: Type chips + Bank select */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_FILTERS.map((filter) => {
          const isSelected = type === filter.value;

          return (
            <Button
              key={filter.label}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(filter.value)}
              className={`h-8 px-3 text-[12px] font-medium ${
                isSelected
                  ? "bg-[#1C1410] text-white hover:bg-[#1C1410]/90"
                  : "border-[#E8E4DE] text-[#8B7355] hover:bg-[#FAFAF8]"
              }`}
            >
              {filter.label}
            </Button>
          );
        })}

        <Select
          value={selectedBank ?? "ALL"}
          onValueChange={(value) =>
            handleBankChange(value === "ALL" ? null : value)
          }
        >
          <SelectTrigger className="h-8 w-[150px] border-[#E8E4DE] bg-white text-[12px] text-[#8B7355]">
            <SelectValue placeholder="All Banks" />
          </SelectTrigger>

          <SelectContent
            className="z-50 border-[#E8E4DE] bg-white text-[#1C1410] shadow-lg"
          >
            <SelectItem value="ALL">All Banks</SelectItem>

            {bankOptions.map((bank) => (
              <SelectItem key={bank} value={bank}>
                {bank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <TransactionSkeleton />
      ) : grouped.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ date, transactions: dateTransactions }) => (
            <div key={date}>
              <div className="mb-1 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B7355]">
                {formatDate(date)}
              </div>
              <div>
                {dateTransactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    account={accountMap[tx.account_id]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Mobile add button */}
      <Button
        className="fixed bottom-20 right-4 h-12 w-12 rounded-[4px] bg-[#C0392B] p-0 text-white shadow-sm hover:bg-[#A83224] lg:hidden"
        size="icon"
        aria-label="Add transaction"
      >
        <Plus size={20} strokeWidth={2} />
      </Button>
    </div>
  );
}
