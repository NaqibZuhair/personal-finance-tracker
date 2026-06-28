import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import categoryRoutes from './routes/category.routes';
import healthRoutes from './routes/health.routes';
import summaryRoutes from './routes/summary.routes';
import transactionRoutes from './routes/transaction.routes';
import accountRoutes from './routes/account.routes';
import authRoutes from './routes/auth.routes';

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
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/summary', summaryRoutes);

export default app;