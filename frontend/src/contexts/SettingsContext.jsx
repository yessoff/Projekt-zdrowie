import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { lightTheme, darkTheme, buildStyles } from "../theme/theme";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    try {
      const stored = localStorage.getItem("pd_theme");
      return stored === "dark" || stored === "light" ? stored : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("pd_theme", themeName);
    } catch {}
  }, [themeName]);

  const [units, setUnits] = useState(() => {
    try {
      const stored = localStorage.getItem("pd_units");
      return stored === "imperial" ? "imperial" : "metric";
    } catch {
      return "metric";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("pd_units", units);
    } catch {}
  }, [units]);

  const theme = themeName === "dark" ? darkTheme : lightTheme;
  const styles = useMemo(() => buildStyles(theme), [theme]);

  const value = useMemo(
    () => ({ themeName, setThemeName, units, setUnits, theme, styles }),
    [themeName, units, theme, styles]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
