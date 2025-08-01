import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useSettings } from '../contexts/SettingsContext';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Slider,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch
} from '@mui/material';

interface Settings {
  thresholdPercentage: number;
  username: string;
  darkMode: boolean;
}

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<Settings>({
    thresholdPercentage: 70,
    username: '',
    darkMode: false
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

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
        ...localSettings,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      await updateSettings(response.data);
      setSuccess('Settings updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh'
    }}>
      <Box sx={{ width: '100%', maxWidth: 'sm' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Paper sx={{ p: 3, width: '100%' }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={localSettings.username}
              onChange={(e) => setLocalSettings({ ...localSettings, username: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />

            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography gutterBottom>
                Threshold Percentage: {localSettings.thresholdPercentage}%
              </Typography>
              <Slider
                value={localSettings.thresholdPercentage}
                onChange={(_, value) => setLocalSettings({ ...localSettings, thresholdPercentage: value as number })}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ mt: 3, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.darkMode}
                    onChange={async (e) => {
                      const newDarkMode = e.target.checked;
                      setLocalSettings({ ...localSettings, darkMode: newDarkMode });
                      try {
                        await updateSettings({ darkMode: newDarkMode });
                      } catch (error) {
                        setError('Failed to update dark mode setting');
                      }
                    }}
                  />
                }
                label="Dark Mode"
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                mt: 3,
                borderRadius: 3,
                width: '40%',
                float: 'right',
              }}
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
      </Box>
    
  );
};

export default Settings; 