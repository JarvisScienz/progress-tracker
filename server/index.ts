import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import activityRoutes from './routes/activities';
import settingsRoutes from './routes/settings';
import { setupEmailNotifications } from './utils/emailNotifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, // cambia con l'URL reale del frontend
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/settings', settingsRoutes);

// MongoDB Connection
console.log("MONGODB_URI", process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/progress-tracker')
  .then(() => {
    console.log('Connected to MongoDB');
    // Setup email notifications
    setupEmailNotifications();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 