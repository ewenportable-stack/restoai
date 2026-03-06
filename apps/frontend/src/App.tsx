import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { LoginPage } from './pages/login-page';
import { AppLayout } from './components/layout/app-layout';
import { DashboardPage } from './pages/dashboard-page';
import { StocksPage } from './pages/stocks-page';
import { IngredientsPage } from './pages/ingredients-page';
import { RecipesPage } from './pages/recipes-page';
import { OrdersPage } from './pages/orders-page';
import { FinancePage } from './pages/finance-page';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="stocks" element={<StocksPage />} />
          <Route path="ingredients" element={<IngredientsPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="finance" element={<FinancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
