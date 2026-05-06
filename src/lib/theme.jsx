import { createContext, useContext, useState } from "react";
import { themes } from "../design-system";

const THEME_NAMES = Object.keys(themes);

function getInitialTheme() {
  try {
    const param = new URLSearchParams(window.location.search).get("theme");
    if (param && THEME_NAMES.includes(param)) return param;
  } catch {}
  return "light";
}

const ThemeContext = createContext({ theme: themes.light, themeName: "light", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(getInitialTheme);
  const theme = themes[themeName] ?? themes.light;
  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme: setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { THEME_NAMES };
