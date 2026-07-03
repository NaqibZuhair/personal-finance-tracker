import { Route, Routes } from 'react-router';
import AppLayout from './components/layout/AppLayout';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import EditTransactionPage from './pages/EditTransactionPage';
import NewTransactionPage from './pages/NewTransactionPage';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import RecurringTransactionsPage from './pages/RecurringTransactionsPage';
import AllocationRoutinesPage from './pages/AllocationRoutinesPage';

import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/transactions/new" element={<NewTransactionPage />} />
                <Route path="/transactions/:id/edit" element={<EditTransactionPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/profile/password" element={<ChangePasswordPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/recurring" element={<RecurringTransactionsPage />} />
                <Route path="/routines" element={<AllocationRoutinesPage />} />
              </Routes>
            </AppLayout>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;