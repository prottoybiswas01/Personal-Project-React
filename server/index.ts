import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import portfolioRoutes from './routes/portfolio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', portfolioRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'MongoDB Atlas Connected', timestamp: new Date() });
});

// Start Server & Connect MongoDB Atlas
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Express Backend Server running live on http://localhost:${PORT}`);
  });
}

startServer();
