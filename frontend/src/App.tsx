import { Route, Routes } from 'react-router';
import AppLayout from './components/layout/AppLayout';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import EditTransactionPage from './pages/EditTransactionPage';
import NewTransactionPage from './pages/NewTransactionPage';
import TransactionsPage from './pages/TransactionsPage';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/new" element={<NewTransactionPage />} />
        <Route path="/transactions/:id/edit" element={<EditTransactionPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;