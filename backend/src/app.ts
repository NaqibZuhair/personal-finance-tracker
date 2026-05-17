import cors from 'cors';
import express from 'express';
import categoryRoutes from './routes/category.routes';
import healthRoutes from './routes/health.routes';
import transactionRoutes from './routes/transaction.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

export default app;