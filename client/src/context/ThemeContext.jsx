import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { applyTheme, getStoredTheme, resolveTheme, THEME_KEY } from "../lib/theme";

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const [preference, setPreferenceState] = useState(getStoredTheme);
  const [resolved, setResolved] = useState(() => resolveTheme(preference));

  const setPreference = useCallback((pref) => {
    try {
      localStorage.setItem(THEME_KEY, pref);
    } catch {
      /* private mode */
    }
    setPreferenceState(pref);
    setResolved(applyTheme(pref));
  }, []);

  useEffect(() => {
    setResolved(applyTheme(preference));
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(applyTheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const toggle = useCallback(() => {
    setPreference(resolved === "dark" ? "light" : "dark");
  }, [resolved, setPreference]);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, toggle }),
    [preference, resolved, setPreference, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
