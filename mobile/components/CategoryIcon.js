import { Pill, Syringe, Droplet } from 'lucide-react-native';

// Small category glyph next to a supplement name (RN port of the web
// CategoryIcon). Oral has no icon. Size matches the web (14).
export default function CategoryIcon({ category, color }) {
  // Decorative — the supplement name beside it already carries the meaning, so
  // keep VoiceOver from announcing a bare, unlabeled glyph.
  const hide = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' };
  if (category === 'Rx') return <Pill size={14} color={color} {...hide} />;
  if (category === 'Injectable') return <Syringe size={14} color={color} {...hide} />;
  if (category === 'Topical') return <Droplet size={14} color={color} {...hide} />;
  return null;
}
