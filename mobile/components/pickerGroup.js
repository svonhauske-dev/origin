import { createContext } from 'react';

// Coordinates inline date/time pickers within a single Modal so only ONE is
// open at a time (otherwise two open spinners overlap). Modal provides
// { openId, setOpenId }; each PickerField claims the slot by its useId.
// Null context → PickerField falls back to its own local open state.
export const PickerGroupContext = createContext(null);
