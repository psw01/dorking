import React, { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sun, Moon, MonitorSmartphone } from 'lucide-react'; // Example icons

const themes = [
  { name: 'light', label: 'Light', icon: <Sun className="h-4 w-4 mr-2" /> },
  { name: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4 mr-2" /> },
  { name: 'cyber', label: 'Cyber', icon: <MonitorSmartphone className="h-4 w-4 mr-2" /> },
];

const THEME_STORAGE_KEY = 'app-theme';

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('light');

  // Effect to apply theme on load and when currentTheme changes
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    // If a theme is stored, use it, otherwise default to 'light'
    const initialTheme = storedTheme || 'light'; 
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (themeName: string) => {
    if (themes.find(t => t.name === themeName)) {
      document.documentElement.dataset.theme = themeName;
      localStorage.setItem(THEME_STORAGE_KEY, themeName);
      setCurrentTheme(themeName);
    } else {
      // Fallback to light theme if an invalid themeName is somehow passed
      document.documentElement.dataset.theme = 'light';
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      setCurrentTheme('light');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
          {currentTheme === 'light' && <Sun className="h-5 w-5" />}
          {currentTheme === 'dark' && <Moon className="h-5 w-5" />}
          {currentTheme === 'cyber' && <MonitorSmartphone className="h-5 w-5" />}
          <span className="sr-only">Toggle theme ({currentTheme})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem key={theme.name} onClick={() => applyTheme(theme.name)}>
            {React.cloneElement(theme.icon, { className: "h-4 w-4 mr-2" })}
            {theme.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
