"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "sepia" | "slate";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("qalamda-theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("qalamda-theme", newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (t: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "theme-sepia", "theme-slate");
    
    if (t === "dark") {
      root.classList.add("dark");
    } else if (t === "sepia") {
      root.classList.add("theme-sepia");
    } else if (t === "slate") {
      root.classList.add("theme-slate");
    } else {
      root.classList.add("light");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
