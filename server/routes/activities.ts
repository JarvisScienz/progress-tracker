import express from 'express';
import {
  getActivities,
  createActivity,
  deleteActivity,
  markActivityComplete,
  getActivityHistory,
  getActivity,
  updateActivity,
  getActivitiesForMonth
} from '../controllers/activities';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all activities for the current user
router.get('/', getActivities);

// Create a new activity
router.post('/', createActivity);

// Get a specific activity
router.get('/:id', getActivity);

// Update an activity
router.put('/:id', updateActivity);

// Delete an activity
router.delete('/:id', deleteActivity);

// Mark activity as complete/incomplete
router.post('/:id/complete', markActivityComplete);

// Get activity completion history
router.get('/:id/history', getActivityHistory);

// Get activities for a specific month
router.get('/month/:year/:month', getActivitiesForMonth);

export default router; 