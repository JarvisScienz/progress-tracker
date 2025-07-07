# Progress Tracker

A web application for tracking activities and helping users reach their goals. The application supports daily, weekly, and monthly activities with email notifications.

## Features

- User registration and authentication
- Create and manage activities
- Set activity frequency (daily, weekly, monthly)
- Email notifications for daily activities
- Dashboard to track progress
- MongoDB database integration

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- UI: Material-UI
- Authentication: JWT
- Email: Nodemailer

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
progress-tracker/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript types
├── server/            # Backend server
│   ├── controllers/   # Route controllers
│   ├── models/        # MongoDB models
│   └── routes/        # API routes
└── public/            # Static files
```
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.