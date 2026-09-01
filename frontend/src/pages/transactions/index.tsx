// frontend/src/pages/TransactionsPage.tsx
import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";

import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import type { Transaction } from "@/types";

import { Button } from "@/components/ui/button";
import MonthSelector from "@/components/analytics/MonthSelector";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionPagination from "@/components/transactions/TransactionPagination";
import TransactionEmptyState from "@/components/transactions/TransactionEmptyState";
import TransactionSkeleton from "@/components/transactions/TransactionSkeleton";
import { usePageTitle } from '@/hooks/usePageTitle'

const PAGE_SIZE = 10;

type AccountInfo = {
  name: string;
  bank: string;
  color: string;
};

function groupByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>(
    (groups, transaction) => {
      const { date } = transaction;
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    },
    {}
  );
}

export default function TransactionsPage() {
  usePageTitle('Transactions')
  
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [type, setType] = useState<Transaction["type"] | undefined>();
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
        ])
      ),
    [accounts]
  );

  const bankOptions = useMemo(() => {
    const banks = accounts.map((account) => account.bank).filter(Boolean);
    return [...new Set(banks)].sort((a, b) => a.localeCompare(b));
  }, [accounts]);

  // ── Filtering ──
  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions.filter((tx) => {
      if (type && tx.type !== type) return false;
      const account = accountMap[tx.account_id];
      if (selectedBank && account?.bank !== selectedBank) return false;
      if (!query) return true;

      const title = tx.note?.toLowerCase() ?? "";
      const category = tx.category?.toLowerCase() ?? "";
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

  // ── Pagination ──
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + PAGE_SIZE);

  const grouped = useMemo(() => {
    const groupedByDate = groupByDate(paginatedTransactions);
    return Object.keys(groupedByDate)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        transactions: groupedByDate[date],
      }));
  }, [paginatedTransactions]);

  // ── Handlers ──
  const handleFilterChange = (newType: Transaction["type"] | undefined) => {
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

  // ── Render ──
  if (isLoading) return <TransactionSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-2xl font-light tracking-tight text-text-primary">
          Transactions
        </h1>
        <p className="mt-1 font-sans text-sm text-text-secondary">
          List of your transactions
        </p>
      </div>

      {/* Month Selector */}
      <MonthSelector
        selectedMonth={month}
        onMonthChange={handleMonthChange}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search transactions, accounts, or categories..."
          className="w-full rounded-[4px] border-[0.5px] border-border bg-surface py-2 pl-9 pr-3 font-sans text-[13px] text-text-primary outline-none placeholder:text-text-muted focus:border-text-primary"
        />
      </div>

      {/* Filters */}
      <TransactionFilters
        type={type}
        onTypeChange={handleFilterChange}
        selectedBank={selectedBank}
        onBankChange={handleBankChange}
        bankOptions={bankOptions}
      />

      {/* Content */}
      {grouped.length === 0 ? (
        <TransactionEmptyState />
      ) : (
        <>
          <TransactionList
            grouped={grouped}
            accountMap={accountMap}
          />

          <TransactionPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}