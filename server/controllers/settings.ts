import { Request, Response } from 'express';
import Settings from '../models/Settings';
import User from '../models/User';
import bcrypt from 'bcryptjs';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    let settings = await Settings.findOne({ userId });

    if (!settings) {
      // Create default settings if they don't exist
      const user = await User.findById(userId);
      settings = await Settings.create({
        userId,
        thresholdPercentage: 70,
        username: user?.name || '',
        darkMode: false
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { thresholdPercentage, username, currentPassword, newPassword, darkMode } = req.body;

    let settings = await Settings.findOne({ userId });
    if (!settings) {
      settings = new Settings({ userId });
    }

    // Update threshold percentage if provided
    if (thresholdPercentage !== undefined) {
      settings.thresholdPercentage = thresholdPercentage;
    }

    // Update username if provided
    if (username) {
      settings.username = username;
      // Also update username in User model
      await User.findByIdAndUpdate(userId, { username });
    }

    // Update darkMode if provided
    if (darkMode !== undefined) {
      settings.darkMode = darkMode;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 