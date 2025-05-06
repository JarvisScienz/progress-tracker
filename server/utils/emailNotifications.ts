import nodemailer from 'nodemailer';
import Activity from '../models/Activity';
import User from '../models/User';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendActivityReminder = async (user: any, activity: any) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Reminder: ${activity.title}`,
    html: `
      <h1>Activity Reminder</h1>
      <p>Hello ${user.name},</p>
      <p>This is a reminder to complete your activity: <strong>${activity.title}</strong></p>
      <p>Description: ${activity.description}</p>
      <p>Don't forget to mark it as complete in the app!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${user.email} for activity ${activity.title}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

export const setupEmailNotifications = () => {
  // Run every day at 9 AM
  setInterval(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all daily activities that haven't been completed today
      const activities = await Activity.find({
        frequency: 'daily',
        isActive: true,
        completedDates: {
          $not: {
            $elemMatch: {
              $gte: today,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
      }).populate('userId');

      // Send reminders for each activity
      for (const activity of activities) {
        await sendActivityReminder(activity.userId, activity);
      }
    } catch (error) {
      console.error('Error in email notification setup:', error);
    }
  }, 24 * 60 * 60 * 1000); // Run every 24 hours
}; 