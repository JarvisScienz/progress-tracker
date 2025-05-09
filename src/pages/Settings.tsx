import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Slider,
  Alert,
  Snackbar
} from '@mui/material';

interface Settings {
  thresholdPercentage: number;
  username: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    thresholdPercentage: 70,
    username: ''
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/settings');
        setSettings(response.data);
      } catch (error) {
        setError('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const response = await api.put('/api/settings', {
        ...settings,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      setSettings(response.data);
      setSuccess('Settings updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              margin="normal"
            />

            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography gutterBottom>
                Threshold Percentage: {settings.thresholdPercentage}%
              </Typography>
              <Slider
                value={settings.thresholdPercentage}
                onChange={(_, value) => setSettings({ ...settings, thresholdPercentage: value as number })}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Change Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              Save Changes
            </Button>
          </form>
        </Paper>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 