
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const THEME_STORAGE_KEY = 'app-theme'; // Same key as in ThemeSwitcher

const App: React.FC = () => {
  // Effect to apply stored theme on initial load
  useEffect(() => {
    const applyTheme = () => {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const initialTheme = storedTheme || 'light'; // Default to 'light'
      document.documentElement.dataset.theme = initialTheme;
    };

    // Apply theme on initial load
    applyTheme();

    // Listen for theme changes
    window.addEventListener('theme-changed', applyTheme);
    window.addEventListener('storage', (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        applyTheme();
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('theme-changed', applyTheme);
      window.removeEventListener('storage', applyTheme);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
