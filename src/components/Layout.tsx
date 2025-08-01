import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  ListItemButton,
  Fab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  CalendarMonth as CalendarMonthIcon,
  Settings
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  //const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Agenda', icon: <CalendarMonthIcon />, path: '/agenda' },
    { text: 'Create Activity', icon: <AddIcon />, path: '/create-activity' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
          Progress Tracker
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                color: 'white',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
                '& .MuiListItemText-root': {
                  color: 'white',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        })}
        <ListItemButton
          onClick={() => {
            logout();
            navigate('/login');
          }}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
            '& .MuiListItemText-root': {
              color: 'white',
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component="nav"
        sx={{ flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'aliceblue',
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Mobile menu button */}
        {isMobile && !mobileOpen && (
          <Fab
            color="primary"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 1300,
              background: 'linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5B21B6 0%, #2563EB 100%)',
              },
            }}
          >
            <MenuIcon />
          </Fab>
        )}
        <Box sx={{ 
          p: 3, 
          margin: '0 auto',
          pt: { xs: 10, sm: 3 }, // Extra top padding on mobile for hamburger menu
          //maxWidth: '1200px'
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
} 