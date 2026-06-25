import { Pill, Syringe, Droplet } from 'lucide-react-native';

// Small category glyph next to a supplement name (RN port of the web
// CategoryIcon). Oral has no icon. Size matches the web (14).
export default function CategoryIcon({ category, color }) {
  if (category === 'Rx') return <Pill size={14} color={color} />;
  if (category === 'Injectable') return <Syringe size={14} color={color} />;
  if (category === 'Topical') return <Droplet size={14} color={color} />;
  return null;
}
