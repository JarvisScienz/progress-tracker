import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box, Snackbar, Alert } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateActivity from './pages/CreateActivity';
import EditActivity from './pages/EditActivity';
import Agenda from './pages/Agenda';
import Settings from './pages/Settings';
import { useEffect, useState } from 'react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

const createAppTheme = (darkMode: boolean) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

function AppContent() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { settings } = useSettings();

  // Gestione online/offline
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Registrazione del service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registrato con successo:', registration);
          setSwRegistration(registration);

          // Controlla aggiornamenti
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Errore durante la registrazione del Service Worker:', error);
        });

      // Gestione di aggiornamenti
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  // Funzione per aggiornare l'app
  const updateApp = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return (
    <ThemeProvider theme={createAppTheme(settings.darkMode)}>
      <CssBaseline />
      <Router>
            {!isOnline && (
              <Box 
                sx={{ 
                  position: 'fixed', 
                  top: 0, 
                  width: '100%', 
                  zIndex: 9999, 
                  textAlign: 'center',
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  py: 0.5,
                }}
              >
                Sei offline. Alcune funzionalità potrebbero essere limitate.
              </Box>
            )}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="create-activity" element={<CreateActivity />} />
                  <Route path="edit-activity/:id" element={<EditActivity />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
      
      {/* Notifica per nuovi aggiornamenti */}
      <Snackbar 
        open={isUpdateAvailable} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          variant="filled"
          action={
            <Box 
              component="button" 
              onClick={updateApp}
              sx={{ 
                color: 'white', 
                background: 'transparent', 
                border: '1px solid white',
                borderRadius: 1,
                px: 2,
                py: 0.5,
                cursor: 'pointer'
              }}
            >
              Aggiorna
            </Box>
          }
        >
          È disponibile una nuova versione dell'app!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;