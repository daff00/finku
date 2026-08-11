import { useAccounts } from '@/hooks'
import { useNetworth } from '@/hooks'
import { formatIDR, formatIDRShort, formatDate, formatDateShort, formatMonth, getCurrentMonth } from '@/lib/formatters'
import { BANK_LABELS, BANK_COLORS, CATEGORY_LABELS } from '@/lib/constants'

export default function DashboardPage() {
    const { data: accounts, isLoading, isError } = useAccounts()
    const { data: networth } = useNetworth()

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading accounts</div>

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>Finku Dashboard Test</h1>
            
            {/* ── Net Worth ── */}
            <h2>Net Worth</h2>
            <p>Short: {formatIDRShort(networth?.total ?? "0")}</p>
            <p>Full: {formatIDR(networth?.total ?? "0")}</p>

            {/* ── Date Formats ── */}
            <h2>Date Formats</h2>
            <p>Full: {formatDate("2026-08-09")}</p>
            <p>Short: {formatDateShort("2026-08-09")}</p>
            <p>Month: {formatMonth(getCurrentMonth())}</p>

            {/* ── Accounts ── */}
            <h2>Accounts ({accounts?.length})</h2>
            {accounts?.map(account => (
                <div key={account.id} style={{ 
                    background: account.color,
                    color: "#fff",
                    padding: "10px",
                    margin: "5px 0",
                    borderRadius: "8px",
                }}>
                    <div>{BANK_LABELS[account.bank]} — {account.name}</div>
                    <div>{formatIDR(networth?.per_account.find(a => a.account_id === account.id)?.balance ?? "0")}</div>
                </div>
            ))}

            {/* ── Per Account Net Worth ── */}
            <h2>Per Account Balance</h2>
            {networth?.per_account.map(acc => (
                <div key={acc.account_id} style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #eee"
                }}>
                    <span style={{ color: acc.color }}>● {acc.name}</span>
                    <span>{formatIDR(acc.balance)}</span>
                </div>
            ))}
        </div>
    )
}