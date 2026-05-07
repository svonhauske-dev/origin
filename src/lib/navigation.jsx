import { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [screenStack, setScreenStack] = useState([{ name: 'home', props: {} }]);

  const pushScreen = useCallback((name, props = {}) => {
    setScreenStack(s => [...s, { name, props }]);
  }, []);

  const popScreen = useCallback(() => {
    setScreenStack(s => s.length > 1 ? s.slice(0, -1) : s);
  }, []);

  const currentScreen = screenStack[screenStack.length - 1];

  return (
    <NavigationContext.Provider value={{ screenStack, currentScreen, pushScreen, popScreen }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
