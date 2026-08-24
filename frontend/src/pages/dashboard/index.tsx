import { NavLink } from 'react-router-dom';
import {
  useAccounts,
  useNetworth,
  useTransactions,
  useMonthly,
} from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import {
  formatIDR,
  formatDateShort,
} from '@/lib/formatters';
import {
  BANK_LABELS,
  BANK_COLORS,
} from '@/lib/constants';
import type {
  Account,
  Transaction,
  MonthlySummary,
} from '@/types';

type CategoryTotal = {
  category: string;
  amount: number;
  percentage: number;
};

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'おはよう';
  }

  if (hour >= 12 && hour < 17) {
    return 'こんにちは';
  }

  if (hour >= 17 && hour < 21) {
    return 'こんばんは';
  }

  return 'おやすみ';
}

function getCurrentMonth(): string {
  return new Date().toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
}

function getCurrentMonthStr(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export default function DashboardPage() {
  const { user } = useAuth();

  const {
    data: accounts,
    isLoading: accountsLoading,
  } = useAccounts();

  const {
    data: networth,
    isLoading: networthLoading,
  } = useNetworth();

  const {
    data: transactions,
    isLoading: transactionsLoading,
  } = useTransactions({
    limit: 50,
  });

  // ✅ Fetch all months
  const {
    data: allMonthlyData,
    isLoading: monthlyLoading,
  } = useMonthly();

  const isLoading =
    accountsLoading ||
    networthLoading ||
    transactionsLoading ||
    monthlyLoading;

  const displayName =
    user?.display_name ||
    user?.username ||
    'Guest';

  const greeting = getGreeting();
  const currentMonthLabel = getCurrentMonth();
  const currentMonthStr = getCurrentMonthStr();

  /*
   * ─────────────────────────────────────────────
   * Loading
   * ─────────────────────────────────────────────
   */

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-border/50 rounded" />
          <div className="h-3 w-44 bg-border/40 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <div className="h-32 bg-border/40 rounded-[4px]" />

            <div className="h-px bg-border/40" />

            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-border/40 rounded-[4px]" />
              <div className="h-24 bg-border/40 rounded-[4px]" />
              <div className="h-24 bg-border/40 rounded-[4px]" />
              <div className="h-24 bg-border/40 rounded-[4px]" />
            </div>

            <div className="h-px bg-border/40" />

            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="h-12 bg-border/40 rounded"
              />
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="h-[420px] bg-border/40 rounded-[4px]" />
          </div>
        </div>
      </div>
    );
  }

  /*
   * ─────────────────────────────────────────────
   * Data
   * ─────────────────────────────────────────────
   */

  const accountList = accounts ?? [];
  const transactionList = transactions ?? [];

  const totalNetworth = networth?.total ?? '0';

  const balanceMap: Record<number, string> = {};

  networth?.per_account?.forEach((account: any) => {
    balanceMap[account.account_id] = account.balance;
  });

  const recentTransactions = transactionList.slice(0, 5);

  // ✅ Get current month's data from the array
  const currentMonthData = allMonthlyData?.find(
    (item: MonthlySummary) => item.month.slice(0, 7) === currentMonthStr
  );

  const totalIncome = currentMonthData?.income ?? 0;
  const totalExpense = currentMonthData?.expenses ?? 0;
  const netChange = currentMonthData?.savings ?? 0;

  // ── Category breakdown (from transactions) ──
  const categoryTotals: Record<string, number> = {};

  transactionList
    .filter((txn) => txn.type === 'EXPENSE')
    .forEach((txn) => {
      const category = txn.category || 'Lainnya';

      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(txn.amount);
    });

  const categoryData: CategoryTotal[] = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpense > 0
          ? Math.round((amount / totalExpense) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  /*
   * ─────────────────────────────────────────────
   * Render
   * ─────────────────────────────────────────────
   */

  return (
    <div className="space-y-8 pb-12">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-[13px] font-normal text-[#8B7355]">
            {greeting}, {displayName}
          </p>

          <p className="font-sans text-[11px] text-[#C4B5A0] mt-0.5">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Mobile Add Button */}
        <NavLink
          to="/transactions"
          className="
            lg:hidden
            inline-flex
            items-center
            gap-1.5
            px-3
            py-1.5
            text-[12px]
            font-sans
            text-[#C0392B]
            border
            border-[#E8E4DE]
            rounded-[4px]
            hover:bg-[#FAFAF8]
            transition-colors
          "
        >
          <span className="text-sm">+</span>
          <span>Tambah</span>
        </NavLink>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">

          {/* Net Worth */}
          <section>
            <div className="mb-2">
              <p className="
                text-[10px]
                uppercase
                tracking-[0.12em]
                text-[#8B7355]
                font-sans
              ">
                NET WORTH
              </p>
            </div>

            <div
              className="
                bg-white
                border-[0.5px]
                border-[#E8E4DE]
                border-l-[3px]
                border-l-[#8B7355]
                rounded-[4px]
                p-5
              "
            >
              <p className="
                font-mono
                text-3xl
                sm:text-4xl
                text-[#1C1410]
                tracking-tight
              ">
                {formatIDR(totalNetworth)}
              </p>

              <p className="
                font-sans
                text-[11px]
                text-[#C4B5A0]
                mt-1
              ">
                Total across {accountList.length} accounts
              </p>

              {netChange !== 0 && (
                <p
                  className={`
                    font-mono
                    text-[11px]
                    mt-3
                    ${netChange >= 0
                      ? 'text-[#27AE60]'
                      : 'text-[#C0392B]'
                    }
                  `}
                >
                  {netChange >= 0 ? '+' : ''}
                  {formatIDR(netChange)}

                  <span className="
                    font-sans
                    text-[#C4B5A0]
                    ml-1
                  ">
                    this month
                  </span>
                </p>
              )}
            </div>
          </section>

          {/* Separator */}
          <div className="border-t-[0.5px] border-[#E8E4DE]" />

          {/* Accounts */}
          <section>
            <div className="flex items-center justify-between">
              <p className="
                text-[10px]
                uppercase
                tracking-[0.12em]
                text-[#8B7355]
                font-sans
              ">
                ACCOUNTS ({accountList.length})
              </p>

              <span className="
                text-[10px]
                text-[#C4B5A0]
                font-sans
              ">
                {accountList.length} total
              </span>
            </div>

            {/* Desktop */}
            <div className="
              hidden
              sm:grid
              grid-cols-2
              gap-3
              mt-3
            ">
              {accountList.map((account: Account) => {
                const balance = balanceMap[account.id] ?? '0';

                const bankColor = BANK_COLORS[account.bank] || '#8B7355';
                const bankLabel = BANK_LABELS[account.bank] || account.bank;

                return (
                  <div
                    key={account.id}
                    className="
                      bg-white
                      border-[0.5px]
                      border-[#E8E4DE]
                      rounded-[4px]
                      p-4
                      hover:bg-[#FAFAF8]
                      transition-colors
                    "
                    style={{
                      borderLeftWidth: '3px',
                      borderLeftColor: bankColor,
                    }}
                  >
                    <p className="
                      text-[13px]
                      text-[#1C1410]
                      font-serif
                    ">
                      {account.name}
                    </p>

                    <p className="
                      text-[10px]
                      text-[#8B7355]
                      font-sans
                      mt-0.5
                    ">
                      {bankLabel} · {account.type}
                    </p>

                    <p className="
                      font-mono
                      text-[15px]
                      text-[#1C1410]
                      mt-3
                    ">
                      {formatIDR(balance)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Mobile */}
            <div className="
              sm:hidden
              flex
              gap-3
              overflow-x-auto
              no-scrollbar
              pb-1
              -mx-4
              px-4
              mt-3
            ">
              {accountList.map((account: Account) => {
                const balance = balanceMap[account.id] ?? '0';

                const bankColor = BANK_COLORS[account.bank] || '#8B7355';
                const bankLabel = BANK_LABELS[account.bank] || account.bank;

                return (
                  <div
                    key={account.id}
                    className="
                      min-w-[150px]
                      bg-white
                      border-[0.5px]
                      border-[#E8E4DE]
                      rounded-[4px]
                      p-3
                      flex-shrink-0
                    "
                    style={{
                      borderTopWidth: '2px',
                      borderTopColor: bankColor,
                    }}
                  >
                    <p className="
                      text-[12px]
                      text-[#1C1410]
                      font-serif
                      truncate
                    ">
                      {account.name}
                    </p>

                    <p className="
                      text-[9px]
                      text-[#8B7355]
                      font-sans
                      mt-0.5
                      truncate
                    ">
                      {bankLabel}
                    </p>

                    <p className="
                      font-mono
                      text-[14px]
                      text-[#1C1410]
                      mt-2
                    ">
                      {formatIDR(balance)}
                    </p>
                  </div>
                );
              })}
            </div>

            {accountList.length === 0 && (
              <div className="
                mt-3
                text-[12px]
                text-[#C4B5A0]
                font-sans
              ">
                Belum ada akun.
              </div>
            )}
          </section>

          {/* Separator */}
          <div className="border-t-[0.5px] border-[#E8E4DE]" />

          {/* Recent Transactions */}
          <section>
            <div className="flex items-center justify-between">
              <p className="
                text-[10px]
                uppercase
                tracking-[0.12em]
                text-[#8B7355]
                font-sans
              ">
                RECENT
              </p>

              <NavLink
                to="/transactions"
                className="
                  text-[11px]
                  text-[#C0392B]
                  font-sans
                  hover:underline
                "
              >
                see all →
              </NavLink>
            </div>

            <div className="
              mt-2
              divide-y
              divide-[#E8E4DE]/60
            ">
              {recentTransactions.length === 0 ? (
                <div className="
                  py-6
                  text-[12px]
                  text-[#C4B5A0]
                  font-sans
                ">
                  Belum ada transaksi.
                </div>
              ) : (
                recentTransactions.map((txn: Transaction) => (
                  <div
                    key={txn.id}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      py-3
                    "
                  >
                    <div className="min-w-0">
                      <p className="
                        text-[13px]
                        text-[#1C1410]
                        font-serif
                        truncate
                      ">
                        {txn.note || txn.category || 'Untitled'}
                      </p>

                      <div className="
                        flex
                        items-center
                        gap-2
                        mt-0.5
                        text-[10px]
                        text-[#C4B5A0]
                        font-sans
                      ">
                        <span>{formatDateShort(txn.date)}</span>

                        <span className="
                          w-1
                          h-1
                          rounded-full
                          bg-[#E8E4DE]
                        " />

                        <span className="uppercase">{txn.category}</span>

                        {txn.source === 'PDF' && (
                          <span className="
                            text-[8px]
                            bg-[#F3F0EB]
                            px-1.5
                            py-0.5
                            rounded
                            text-[#8B7355]
                          ">
                            PDF
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`
                        font-mono
                        text-[13px]
                        flex-shrink-0
                        ${
                          txn.type === 'INCOME'
                            ? 'text-[#27AE60]'
                            : txn.type === 'EXPENSE'
                              ? 'text-[#C0392B]'
                              : 'text-[#8B7355]'
                        }
                      `}
                    >
                      {txn.type === 'EXPENSE'
                        ? '-'
                        : txn.type === 'INCOME'
                          ? '+'
                          : ''}
                      {formatIDR(txn.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="
          lg:col-span-5
          bg-white
          border-[0.5px]
          border-[#E8E4DE]
          rounded-[4px]
          p-5
          lg:p-6
          space-y-6
        ">

          {/* Cashflow */}
          <section>
            <p className="
              text-[10px]
              uppercase
              tracking-[0.12em]
              text-[#8B7355]
              font-sans
            ">
              RINGKASAN CASHFLOW
            </p>

            <p className="
              text-[9px]
              uppercase
              tracking-wider
              text-[#C4B5A0]
              font-sans
              mt-1
            ">
              {currentMonthLabel}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="
                p-3
                bg-[#FAFAF8]
                rounded-[4px]
                border-[0.5px]
                border-[#E8E4DE]
              ">
                <p className="
                  text-[9px]
                  uppercase
                  tracking-wider
                  text-[#8B7355]
                  font-sans
                ">
                  Pemasukan
                </p>

                <p className="
                  font-mono
                  text-[14px]
                  text-[#27AE60]
                  mt-1
                ">
                  +{formatIDR(totalIncome)}
                </p>
              </div>

              <div className="
                p-3
                bg-[#FAFAF8]
                rounded-[4px]
                border-[0.5px]
                border-[#E8E4DE]
              ">
                <p className="
                  text-[9px]
                  uppercase
                  tracking-wider
                  text-[#8B7355]
                  font-sans
                ">
                  Pengeluaran
                </p>

                <p className="
                  font-mono
                  text-[14px]
                  text-[#C0392B]
                  mt-1
                ">
                  -{formatIDR(totalExpense)}
                </p>
              </div>
            </div>
          </section>

          {/* Separator */}
          <div className="border-t-[0.5px] border-[#E8E4DE]" />

          {/* Category Spending */}
          <section>
            <p className="
              text-[10px]
              uppercase
              tracking-[0.12em]
              text-[#8B7355]
              font-sans
            ">
              PENGELUARAN KATEGORI
            </p>

            <div className="space-y-4 mt-4">
              {categoryData.length === 0 ? (
                <p className="
                  text-[12px]
                  text-[#C4B5A0]
                  font-sans
                ">
                  Belum ada pengeluaran.
                </p>
              ) : (
                categoryData.map(({ category, amount, percentage }) => (
                  <div key={category} className="space-y-1">
                    <div className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      text-[11px]
                      font-sans
                    ">
                      <span className="
                        text-[#1C1410]
                        truncate
                      ">
                        {category}
                      </span>

                      <span className="
                        font-mono
                        text-[#8B7355]
                        flex-shrink-0
                      ">
                        {formatIDR(amount)} ({percentage}%)
                      </span>
                    </div>

                    <div className="
                      w-full
                      h-[4px]
                      bg-[#E8E4DE]
                      rounded-full
                      overflow-hidden
                    ">
                      <div
                        className="
                          h-full
                          rounded-full
                          transition-all
                          duration-500
                        "
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: '#8B7355',
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Separator */}
          <div className="border-t-[0.5px] border-[#E8E4DE]" />

          {/* Wabi-Sabi Note */}
          <section className="
            p-4
            bg-[#FAFAF8]
            border-[0.5px]
            border-[#E8E4DE]
            rounded-[4px]
          ">
            <p className="
              text-[10px]
              font-semibold
              font-sans
              uppercase
              tracking-[0.12em]
              text-[#8B7355]
            ">
              WABI-SABI • 侘寂
            </p>

            <p className="
              text-[12px]
              text-[#8B7355]
              font-sans
              leading-relaxed
              mt-1
            ">
              Menghargai proses finansial bertahap.
              Fokus pada kejelasan angka, kurangi
              distraksi, dan jaga ruang bernapas (Ma).
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}