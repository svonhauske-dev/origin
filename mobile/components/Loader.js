import { View } from 'react-native';
import InlineLoader from './InlineLoader';
import { theme } from '../theme';

// Full-screen loader (RN port of src/components/Loader.jsx) — the wave animation
// at 120px, centered on the canvas. Used for initial app/data load.
export default function Loader() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.surface.canvas, alignItems: 'center', justifyContent: 'center' }}>
      <InlineLoader size="full" />
    </View>
  );
}
