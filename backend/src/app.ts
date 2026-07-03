import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import categoryRoutes from './routes/category.routes';
import healthRoutes from './routes/health.routes';
import summaryRoutes from './routes/summary.routes';
import transactionRoutes from './routes/transaction.routes';
import accountRoutes from './routes/account.routes';
import authRoutes from './routes/auth.routes';
import goalRoutes from './routes/goal.routes';
import budgetRoutes from './routes/budget.routes';
import recurringRoutes from './routes/recurring.routes';
import routineRoutes from './routes/routine.routes';
import { requireAuth } from './middleware/auth.middleware';

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.json({
    message: 'Personal Finance Tracker API is running',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      transactions: '/api/transactions',
      monthlySummary: '/api/summary/monthly?month=2026-05',
      categorySummary: '/api/summary/categories?month=2026-05',
      recentTransactions: '/api/summary/recent',
    },
  });
});

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/accounts', requireAuth, accountRoutes);
app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);
app.use('/api/summary', requireAuth, summaryRoutes);
app.use('/api/goals', requireAuth, goalRoutes);
app.use('/api/budgets', requireAuth, budgetRoutes);
app.use('/api/recurring', requireAuth, recurringRoutes);
app.use('/api/routines', requireAuth, routineRoutes);

export default app;