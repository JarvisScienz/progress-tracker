import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  TextField,
} from '@mui/material';
import {
  Check as CheckIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import { useSettings } from '../contexts/SettingsContext';

interface Activity {
  _id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  completionHistory: Array<{
    date: string;
    completed: boolean;
    description?: string;
  }>;
  isActive: boolean;
  daysRecord: number;
  daysInRow: number;
}

interface HistoryDialogProps {
  open: boolean;
  onClose: () => void;
  history: Array<{
    date: string;
    completed: boolean;
    description?: string;
  }>;
}

function HistoryDialog({ open, onClose, history }: HistoryDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Activity History</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {record.completed ? 'Completed' : 'Not Completed'}
                  </TableCell>
                  <TableCell>
                    {record.description || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [completionDescription, setCompletionDescription] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const navigate = useNavigate();
  const { settings } = useSettings();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/api/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleMarkComplete = async (activityId: string) => {
    try {
      const activity = activities.find(a => a._id === activityId);
      if (!activity) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isCompletedToday = activity.completionHistory.some(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime() && record.completed;
      });

      if (!isCompletedToday) {
        // Show completion dialog when marking as complete
        setSelectedActivity(activity);
        setCompletionDialogOpen(true);
      } else {
        // Mark as incomplete directly
        const today = new Date();
        const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        await api.post(`/api/activities/${activityId}/complete`, {
          completed: false,
          date: localDate
        });
        fetchActivities();
      }
    } catch (error) {
      console.error('Error marking activity complete:', error);
    }
  };

  const handleCompleteWithDescription = async () => {
    if (!selectedActivity) return;
    
    try {
      const today = new Date();
      const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
      
      await api.post(`/api/activities/${selectedActivity._id}/complete`, {
        completed: true,
        description: completionDescription,
        date: localDate
      });
      setCompletionDialogOpen(false);
      setCompletionDescription('');
      setSelectedActivity(null);
      fetchActivities();
    } catch (error) {
      console.error('Error marking activity complete:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedActivity) return;
    try {
      await api.delete(`/api/activities/${selectedActivity._id}`);
      setDeleteDialogOpen(false);
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'primary';
      case 'weekly':
        return 'secondary';
      case 'monthly':
        return 'success';
      default:
        return 'default';
    }
  };

  const isCompletedToday = (activity: Activity) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activity.completionHistory.some(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime() && record.completed;
    });
  };

  const getCompletedCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return activities.filter(activity => 
      activity.completionHistory.some(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime() && record.completed;
      })
    ).length;
  };

  const getProgressPercentage = () => {
    if (activities.length === 0) return 0;
    return (getCompletedCount() / activities.length) * 100;
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    return percentage >= settings.thresholdPercentage ? 'success' : 'error';
  };

  return (
    <Box>
      <Box sx={{ mb: 4, width: '100%' }}>
        <Typography variant="h4" gutterBottom>
          Hi {settings.username}, Your Activities
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, width: '100%' }}>
          <Typography variant="h6">
            Progress: {getCompletedCount()}/{activities.length} activities completed
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={getProgressPercentage()} 
              color={getProgressColor()}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body1" sx={{ minWidth: '60px', textAlign: 'right' }}>
            {Math.round(getProgressPercentage())}%
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {activities.map((activity) => (
          <Grid size={{xs:12, sm:6, md:4}}  key={activity._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {activity.title}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {activity.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={activity.frequency}
                    color={getFrequencyColor(activity.frequency)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Started: {new Date(activity.startDate).toLocaleDateString()}
                </Typography>
                {activity.endDate && (
                  <Typography variant="body2" color="text.secondary">
                    Ends: {new Date(activity.endDate).toLocaleDateString()}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Completed: {activity.completionHistory.filter(h => h.completed).length} times
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days in row: {activity.daysInRow} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Records: {activity.daysRecord} days
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={() => handleMarkComplete(activity._id)}
                  color={isCompletedToday(activity) ? 'success' : 'primary'}
                >
                  {isCompletedToday(activity) ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedActivity(activity);
                    setHistoryDialogOpen(true);
                  }}
                >
                  <HistoryIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/edit-activity/${activity._id}`)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedActivity(activity);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Activity</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{selectedActivity?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {selectedActivity && (
        <HistoryDialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          history={selectedActivity.completionHistory}
        />
      )}

      <Dialog open={completionDialogOpen} onClose={() => setCompletionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Activity</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You're about to mark "{selectedActivity?.title}" as complete.
          </Typography>
          <TextField
            label="Description (optional)"
            multiline
            rows={3}
            fullWidth
            value={completionDescription}
            onChange={(e) => setCompletionDescription(e.target.value)}
            placeholder="Describe what you accomplished..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompletionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCompleteWithDescription} variant="contained" color="primary">
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}