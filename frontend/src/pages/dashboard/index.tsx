import { NavLink } from 'react-router-dom';
import { useAccounts, useNetworth, useTransactions, useMonthly } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import {
  formatIDR,
  formatDateShort,
} from '@/lib/formatters';
import { BANK_LABELS, BANK_COLORS } from '@/lib/constants';
import type { Account, Transaction } from '@/types';

// ── Types ──────────────────────────────────────────────────────
type MonthlyData = {
  total_income: number;
  total_expense: number;
  net_change?: number;
};

// ── Time-based greeting ──────────────────────────────────────
function getGreeting(): { greeting: string; message: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Ohayou',
      message: 'Have a productive day ahead.',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Konnichiwa',
      message: 'Keep up the good work.',
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: 'Konbanwa',
      message: 'Wind down and reflect on today.',
    };
  } else {
    return {
      greeting: 'Oyasumi',
      message: 'Rest well and recharge.',
    };
  }
}

function getCurrentMonth(): string {
  return new Date().toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: networth, isLoading: networthLoading } = useNetworth();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({ limit: 5 });
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthly() as {
    data: MonthlyData | undefined;
    isLoading: boolean;
  };

  const isLoading = accountsLoading || networthLoading || transactionsLoading || monthlyLoading;

  const { greeting, message } = getGreeting();
  const displayName = user?.display_name || user?.username || 'Guest';
  const currentMonth = getCurrentMonth();

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-border/50 rounded" />
          <div className="h-12 w-48 bg-border/50 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-20 bg-border/50 rounded-[4px]" />
          <div className="h-20 bg-border/50 rounded-[4px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-border/50 rounded-[4px]" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-border/50 rounded-[4px]" />
          ))}
        </div>
      </div>
    );
  }

  // ── Data ──
  const totalNetworth = networth?.total ?? '0';
  const balanceMap: Record<number, string> = {};
  networth?.per_account?.forEach((acc: any) => {
    balanceMap[acc.account_id] = acc.balance;
  });
  const recentTransactions = transactions?.slice(0, 5) ?? [];

  // ✅ Now these work with the type assertion above
  const totalIncome = monthlyData?.total_income ?? 0;
  const totalExpense = monthlyData?.total_expense ?? 0;

  // ── Render ──
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-light text-text-primary tracking-tight font-serif">
          Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1 font-sans">
          {greeting}, {displayName}
        </p>
        <p className="text-xs text-text-muted/60 mt-0.5 font-sans">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Cashflow Summary */}
      <section>
        <h2 className="label-section mb-2 font-serif">RINGKASAN CASHFLOW — {currentMonth.toUpperCase()}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-4 border-l-[3px] border-income">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans">
              Pemasukan
            </p>
            <p className="font-mono text-2xl text-income mt-1">
              +{formatIDR(totalIncome)}
            </p>
          </div>
          <div className="card p-4 border-l-[3px] border-expense">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted font-sans">
              Pengeluaran
            </p>
            <p className="font-mono text-2xl text-expense mt-1">
              -{formatIDR(totalExpense)}
            </p>
          </div>
        </div>
      </section>

      {/* Net Worth */}
      <section>
        <h2 className="label-section mb-2 font-serif">Net Worth</h2>
        <div className="card p-6 border-l-[4px] border-accent">
          <p className="font-mono text-4xl sm:text-5xl text-text-primary tracking-tight">
            {formatIDR(totalNetworth)}
          </p>
          <p className="text-text-muted text-sm mt-1 font-sans">
            Total across {accounts?.length || 0} accounts
          </p>
        </div>
      </section>

      {/* Accounts */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="label-section font-serif">Accounts</h2>
          <span className="text-xs text-text-muted font-sans">
            {accounts?.length || 0} total
          </span>
        </div>
        {accounts?.length === 0 ? (
          <div className="card p-6 text-center text-text-muted text-sm font-sans">
            No accounts added yet.
            <br />
            <span className="text-xs">Import a bank statement or add manually.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts?.map((account: Account) => {
              const balance = balanceMap[account.id] ?? '0';
              const bankColor = BANK_COLORS[account.bank] || '#6B7280';
              const bankLabel = BANK_LABELS[account.bank] || account.bank;
              return (
                <div
                  key={account.id}
                  className="card p-4 border-l-[3px] hover:bg-border/10 transition-colors"
                  style={{ borderLeftColor: bankColor }}
                >
                  <div>
                    <p className="text-text-primary font-medium text-sm font-serif">
                      {account.name}
                    </p>
                    <p className="text-text-muted text-xs tracking-wide font-sans">
                      {bankLabel} · {account.type}
                    </p>
                  </div>
                  <p className="font-mono text-lg text-text-primary mt-2">
                    {formatIDR(balance)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="label-section font-serif">Recent Transactions</h2>
          <NavLink
            to="/transactions"
            className="text-xs text-text-muted hover:text-accent transition-colors font-sans"
          >
            View all →
          </NavLink>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="card p-6 text-center text-text-muted text-sm font-sans">
            No transactions yet.
            <br />
            <span className="text-xs">Import a bank statement or add manually.</span>
          </div>
        ) : (
          <div className="card divide-y divide-border/50">
            {recentTransactions.map((txn: Transaction) => (
              <div
                key={txn.id}
                className="flex justify-between items-center py-3 px-1 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-text-primary text-sm truncate font-serif">
                    {txn.note || txn.category || 'Untitled'}
                  </span>
                  <div className="flex items-center gap-2 text-text-muted text-[11px] font-sans">
                    <span>{formatDateShort(txn.date)}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="uppercase tracking-wide">{txn.category}</span>
                    {txn.source === 'PDF' && (
                      <span className="text-[9px] bg-border/30 px-1.5 py-0.5 rounded">
                        PDF
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`font-mono text-sm font-medium flex-shrink-0 ml-4 ${
                    txn.type === 'INCOME'
                      ? 'text-income'
                      : txn.type === 'EXPENSE'
                      ? 'text-expense'
                      : 'text-text-muted'
                  }`}
                >
                  {txn.type === 'EXPENSE' ? '-' : txn.type === 'INCOME' ? '+' : ''}
                  {formatIDR(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Wabi-Sabi Footer */}
      <div className="border-t border-dashed border-border/50 pt-6 mt-8">
        <p className="text-center text-[11px] text-text-muted/60 leading-relaxed max-w-md mx-auto font-serif">
          WABI-SABI · 伝家
        </p>
        <p className="text-center text-[10px] text-text-muted/40 leading-relaxed max-w-md mx-auto mt-1 font-sans">
          Menghargai proses finansial bertahap. Fokus pada kejelasan angka,<br />
          kurangi distraksi, dan jaga ruang bernapas (Ma).
        </p>
      </div>
    </div>
  );
}