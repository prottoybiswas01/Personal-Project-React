import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../server/db';
import portfolioRoutes from '../server/routes/portfolio';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB Atlas serverless instance
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB Serverless connection error:', err);
  }
  next();
});

// API Routes
app.use('/api', portfolioRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: 'Vercel Serverless Function',
    database: 'MongoDB Atlas',
    timestamp: new Date()
  });
});

export default app;
