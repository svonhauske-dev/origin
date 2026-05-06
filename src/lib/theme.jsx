import { createContext, useContext, useState, useEffect } from "react";
import { themes } from "../design-system";

export const THEME_NAMES = Object.keys(themes);
const PREF_KEY = "origin_theme_preference";
const VALID_PREFS = ["light", "dark", "system"];

function getSystemTheme() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function resolveTheme(pref) {
  if (pref === "system") return getSystemTheme();
  if (THEME_NAMES.includes(pref)) return pref;
  return "light";
}

function getStoredPref() {
  try {
    const v = localStorage.getItem(PREF_KEY);
    return VALID_PREFS.includes(v) ? v : "system";
  } catch {
    return "system";
  }
}

function getInitial() {
  const pref = getStoredPref();
  let name = resolveTheme(pref);
  // URL param overrides resolved theme for dev/sharing — doesn't change stored pref
  try {
    const param = new URLSearchParams(window.location.search).get("theme");
    if (param && THEME_NAMES.includes(param)) name = param;
  } catch {}
  return { pref, name };
}

const ThemeContext = createContext({
  theme: themes.light,
  themeName: "light",
  themePreference: "system",
  setTheme: () => {},
  setThemePreference: () => {},
});

export function ThemeProvider({ children }) {
  const [{ pref, name }, setState] = useState(getInitial);

  // Live system color-scheme listener — only active when preference is 'system'
  useEffect(() => {
    if (pref !== "system") return;
    try {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        setState(s => s.pref === "system" ? { ...s, name: getSystemTheme() } : s);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } catch {}
  }, [pref]);

  // Persists preference to localStorage and resolves new active theme
  const setThemePreference = (newPref) => {
    try { localStorage.setItem(PREF_KEY, newPref); } catch {}
    setState({ pref: newPref, name: resolveTheme(newPref) });
  };

  // Dev-only: set active theme without touching stored preference (used by DevThemePicker)
  const setTheme = (newName) => {
    setState(s => ({ ...s, name: newName }));
  };

  const theme = themes[name] ?? themes.light;

  return (
    <ThemeContext.Provider value={{ theme, themeName: name, themePreference: pref, setTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
