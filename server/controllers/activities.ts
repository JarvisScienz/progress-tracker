import { Request, Response } from 'express';
import Activity, { IActivity, ActivityFrequency } from '../models/Activity';

const isSamePeriod = (date1: Date, date2: Date, frequency: ActivityFrequency): boolean => {
  if (frequency === 'daily') {
    return date1.toDateString() === date2.toDateString();
  } else if (frequency === 'weekly') {
    const week1 = Math.floor(date1.getTime() / (7 * 24 * 60 * 60 * 1000));
    const week2 = Math.floor(date2.getTime() / (7 * 24 * 60 * 60 * 1000));
    return week1 === week2;
  } else {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }
};

export const createActivity = async (req: Request, res: Response) => {
  try {
    const { title, description, frequency, startDate, endDate } = req.body;
    const userId = (req as any).user._id;

    const activity = new Activity({
      userId,
      title,
      description,
      frequency,
      startDate,
      endDate,
      completedDates: [],
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const activities = await Activity.find({ userId, isActive: true });
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivity = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity', error });
  }
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const { title, description, frequency, startDate, endDate } = req.body;
    
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Update only the fields that are provided
    if (title) activity.title = title;
    if (description) activity.description = description;
    if (frequency) activity.frequency = frequency;
    if (startDate) activity.startDate = startDate;
    if (endDate !== undefined) activity.endDate = endDate || null;

    const updatedActivity = await activity.save();
    res.json(updatedActivity);
  } catch (error) {
    res.status(500).json({ message: 'Error updating activity', error });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const activity = await Activity.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markActivityComplete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;
    const { date, completed } = req.body;

    const activity = await Activity.findOne({ _id: id, userId });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Check if there's already a record for this period
    const existingRecord = activity.completionHistory.find(record => 
      isSamePeriod(new Date(record.date), targetDate, activity.frequency)
    );

    if (existingRecord) {
      // Update existing record
      existingRecord.completed = completed;
    } else {
      // Add new record
      activity.completionHistory.push({
        date: targetDate,
        completed: completed
      });
    }

    await activity.save();
    res.json(activity);
  } catch (error) {
    console.error('Mark activity complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivityHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const activity = await Activity.findOne({ _id: id, userId });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Sort history by date
    const sortedHistory = activity.completionHistory.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json(sortedHistory);
  } catch (error) {
    console.error('Get activity history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivitiesForMonth = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { year, month } = req.params;
    console.log("Year", year, "Month", month);
    // Create start and end dates for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    // Get all activities that were active during this month
    const activities = await Activity.find({
      userId,
      isActive: true,
      /*$or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: startDate } }
      ],
      startDate: { $lte: endDate }*/
    });
    console.log("Activites found", activities);
    // Create a map of dates to activity status
    const monthData: Record<string, { total: number; completed: number }> = {};
    
    // Initialize all days in the month
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      monthData[dateStr] = { total: 0, completed: 0 };
    }

    // Count activities for each day
    activities.forEach(activity => {
      activity.completionHistory.forEach(record => {
        const recordDate = new Date(record.date);
        if (recordDate >= startDate && recordDate <= endDate) {
          const dateStr = recordDate.toISOString().split('T')[0];
          if (!monthData[dateStr]) {
            monthData[dateStr] = { total: 0, completed: 0 };
          }
          monthData[dateStr].total++;
          if (record.completed) {
            monthData[dateStr].completed++;
          }
        }
      });
    });

    res.json(monthData);
  } catch (error) {
    console.error('Get activities for month error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 