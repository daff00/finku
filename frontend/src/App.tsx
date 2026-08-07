import { Routes, Route } from 'react-router-dom'
import DashboardPage from '@/pages/dashboard'
import TransactionsPage from '@/pages/transactions'
import AnalyticsPage from '@/pages/analytics'
import SettingsPage from '@/pages/settings'
import ImportPage from '@/pages/import'

function App() {
  return (
    <Routes>
      <Route path='/' element={<DashboardPage />}></Route>
      <Route path='/transactions' element={<TransactionsPage />}></Route>
      <Route path='/analytics' element={<AnalyticsPage />}></Route>
      <Route path='/import' element={<ImportPage />}></Route>
      <Route path='/settings' element={<SettingsPage />}></Route>
    </Routes>
  )
}

export default App