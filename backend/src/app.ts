import express, { Request, Response } from 'express';
import cors from 'cors';
import studentRoutes from './routes/studentRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Student routes
app.use('/api/students', studentRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export default app; 