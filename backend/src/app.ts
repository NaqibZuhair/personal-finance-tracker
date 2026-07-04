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
import helmet from 'helmet';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();

app.use(helmet());

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS Policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Bot-Secret', 'Cookie'],
  })
);

app.use(apiLimiter);
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

app.use('/api/accounts', requireAuth, accountRoutes);
app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);
app.use('/api/summary', requireAuth, summaryRoutes);
app.use('/api/goals', requireAuth, goalRoutes);
app.use('/api/budgets', requireAuth, budgetRoutes);
app.use('/api/recurring', requireAuth, recurringRoutes);
app.use('/api/routines', requireAuth, routineRoutes);

export default app;