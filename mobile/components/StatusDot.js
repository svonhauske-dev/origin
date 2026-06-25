import { View } from 'react-native';
import { theme } from '../theme';

// Tiny colored status dot (RN port of src/components/StatusDot.jsx).
export default function StatusDot({ status, size = 6, style }) {
  const color =
    status === 'success' ? theme.status.success :
    status === 'warning' ? theme.status.warning :
    status === 'danger' ? theme.status.danger :
    theme.text.tertiary;
  return (
    <View
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}
