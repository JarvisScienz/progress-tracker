import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from '@mui/material';
import api from '../api/axios';

interface Activity {
  _id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
}

export default function EditActivity() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await api.get(`/api/activities/${id}`);
        setActivity(response.data);
      } catch (err) {
        setError('Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    try {
      await api.put(`/api/activities/${id}`, activity);
      navigate('/');
    } catch (err) {
      setError('Failed to update activity');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activity) return;
    setActivity({
      ...activity,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!activity) {
    return (
      <Container>
        <Alert severity="error">Activity not found</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Edit Activity
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Title"
            name="title"
            value={activity.title}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={4}
            value={activity.description}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            select
            id="frequency"
            label="Frequency"
            name="frequency"
            value={activity.frequency}
            onChange={handleChange}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>
          <TextField
            margin="normal"
            required
            fullWidth
            id="startDate"
            label="Start Date"
            name="startDate"
            type="date"
            value={activity.startDate.split('T')[0]}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            id="endDate"
            label="End Date (Optional)"
            name="endDate"
            type="date"
            value={activity.endDate ? activity.endDate.split('T')[0] : ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Save Changes
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 