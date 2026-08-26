// frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/login";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Analytics from "@/pages/analytics";
import Import from "@/pages/import";
import Settings from "@/pages/settings";
import NotFoundPage from "@/pages/NotFoundPage";
import RegisterPage from "@/pages/RegisterPage";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      {/* Toaster is now outside Routes — always available */}
      <Toaster position="top-right" richColors closeButton />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
    </>
  );
}

export default App;