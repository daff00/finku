import { useAccounts } from '@/hooks'
import { useNetworth } from '@/hooks'

export default function DashboardPage() {
    const { data: accounts, isLoading, isError } = useAccounts()
    const { data: networth } = useNetworth()

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading accounts</div>

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Net worth: {networth?.total}</p>
            <ul>
                {accounts?.map(account => (
                    <li key={account.id}>
                        {account.name} — {account.bank}
                    </li>
                ))}
            </ul>
        </div>
    )
}