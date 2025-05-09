import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Settings {
  thresholdPercentage: number;
  username: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    thresholdPercentage: 70,
    username: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const response = await axios.put('/api/settings', newSettings);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 