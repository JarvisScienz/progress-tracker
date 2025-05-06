import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Toolbar,
  AppBar,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
  Today,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import api from '../api/axios';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { it } from 'date-fns/locale';

interface DayData {
  total: number;
  completed: number;
  activities: Array<{
    id: string;
    name: string;
    completed: boolean;
  }>;
}

export default function Agenda() {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthData, setMonthData] = useState<Record<string, DayData>>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMonthData();
  }, [selectedDate]);

  const fetchMonthData = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const response = await api.get(`/api/activities/month/${year}/${month}`);
      setMonthData(response.data);
    } catch (error) {
      console.error('Error fetching month data:', error);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePrevMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setDialogOpen(true);
  };

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const data = monthData[dateStr];
    if (!data || data.total === 0) return null;
    const percentage = (data.completed / data.total) * 100;
    return percentage >= 70 ? 'success' : 'error';
  };

  // Days of week starting from Monday
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Generate calendar days including days from prev/next month to fill grid
  const generateCalendarDays = () => {
    const firstDayOfMonth = startOfMonth(selectedDate);
    const lastDayOfMonth = endOfMonth(selectedDate);
    
    // Find the Monday before or on the first day of the month
    const start = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
    
    // Find the Sunday after or on the last day of the month
    const end = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
    
    // Generate all days in the interval
    return eachDayOfInterval({ start, end });
  };

  const renderDay = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, selectedDate);
    const isCurrentDay = isToday(day);
    const dateStr = format(day, 'yyyy-MM-dd');
    const data = monthData[dateStr];
    const status = getDayStatus(day);

    return (
      <Paper
        key={day.toString()}
        elevation={0}
        sx={{
          height: '100%',
          minHeight: '90px',
          cursor: 'pointer',
          position: 'relative',
          backgroundColor: isCurrentDay ? theme.palette.primary.light + '20' : 'background.paper',
          opacity: isCurrentMonth ? 1 : 0.5,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: 0,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        onClick={() => handleDayClick(day)}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="body2" 
            color={isCurrentMonth ? 'textPrimary' : 'textSecondary'}
            sx={{ fontWeight: isCurrentDay ? 'bold' : 'normal' }}
          >
            {format(day, 'd')}
          </Typography>
          {data && data.total > 0 && (
            status === 'success' ? (
              <CheckIcon color="success" fontSize="small" />
            ) : (
              <CloseIcon color="error" fontSize="small" />
            )
          )}
        </Box>
      </Paper>
    );
  };

  const renderDayDetails = () => {
    if (!selectedDay) return null;
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    const data = monthData[dateStr];

    return (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {format(selectedDay, 'EEEE d MMMM yyyy', { locale: it })}
        </DialogTitle>
        <DialogContent>
          {data ? (
            <List>
              {data.activities.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemIcon>
                    {activity.completed ? (
                      <CheckIcon color="success" />
                    ) : (
                      <CloseIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={activity.name} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Nessuna attività registrata per questo giorno</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const days = generateCalendarDays();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.default',
    }}>
      <AppBar 
        position="static" 
        color="default" 
        elevation={0}
      >
        <Toolbar sx={{ 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          py: { xs: 2, sm: 1 },
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: { xs: 0, sm: 2 },
            mb: { xs: 1, sm: 0 },
          }}>
            <CalendarMonth sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" color="primary">
              Calendario
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleToday} 
              startIcon={<Today />}
            >
              Oggi
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handlePrevMonth} size="small">
                <ChevronLeft />
              </IconButton>
              <Typography variant="body1" sx={{ mx: 1 }}>
                {format(selectedDate, 'MMMM yyyy', { locale: it })}
              </Typography>
              <IconButton onClick={handleNextMonth} size="small">
                <ChevronRight />
              </IconButton>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
              <DatePicker
                views={['year', 'month']}
                value={selectedDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: { 
                    size: "small",
                    sx: { width: { xs: '100%', sm: 120 } }
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        flex: 1, 
        p: { xs: 1, sm: 2 },
        overflow: 'auto',
      }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0,
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          width: '100%',
        }}>
          {daysOfWeek.map((day) => (
            <Box key={day}>
              <Typography 
                sx={{ 
                  py: 1,
                  textAlign: 'center',
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0,
          width: '100%',
        }}>
          {days.map((day) => (
            <Box key={day.toString()}>
              {renderDay(day)}
            </Box>
          ))}
        </Box>
      </Box>

      {renderDayDetails()}
    </Box>
  );
}