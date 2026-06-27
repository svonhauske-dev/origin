import { createContext, useContext } from 'react';

// Carries the current theme choice + setter to deep consumers (the Settings
// picker). The actual token application happens at the top of App's render
// (so App's own root surface reads the right theme), see App.js.
//
// value = { name, appearance, themeKey, setTheme(patch) }
export const ThemeChoiceContext = createContext(null);

export function useThemeChoice() {
  return useContext(ThemeChoiceContext);
}
