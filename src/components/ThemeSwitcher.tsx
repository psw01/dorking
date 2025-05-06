
import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('dork-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('dork-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      description: "Theme preference saved for future visits."
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="rounded-full w-8 h-8"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-yellow-400" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeSwitcher;
