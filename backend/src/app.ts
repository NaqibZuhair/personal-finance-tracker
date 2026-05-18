import cors from 'cors';
import express from 'express';
import categoryRoutes from './routes/category.routes';
import healthRoutes from './routes/health.routes';
import summaryRoutes from './routes/summary.routes';
import transactionRoutes from './routes/transaction.routes';

const app = express();

app.use(cors());
app.use(express.json());

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
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/summary', summaryRoutes);

export default app;