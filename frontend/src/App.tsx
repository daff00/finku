// frontend/src/App.tsx
import { Routes, Route } from "react-router-dom"; // ← no BrowserRouter import
import LoginPage from "@/pages/login";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Analytics from "@/pages/analytics";
import Import from "@/pages/import";
import Settings from "@/pages/settings";
import NotFoundPage from "@/pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/import" element={<Import />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
