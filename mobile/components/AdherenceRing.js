import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme, fonts, typography } from '../theme';

// Circular adherence ring (RN port of src/components/AdherenceRing.jsx).
// Same geometry: track circle + progress arc rotated -90°, rounded cap.
// Center % text is an absolutely-positioned RN Text (font-matched) instead of
// an SVG <text>, so it uses the loaded JetBrains Mono face cleanly.
export default function AdherenceRing({ percentage, size = 56, showText = true }) {
  const stroke = size <= 32 ? 3 : 5;
  const pad = size <= 32 ? 3 : 6;
  const r = Math.floor(size / 2) - pad;
  const circ = 2 * Math.PI * r;
  const dash = circ * (percentage / 100);
  const cx = size / 2;
  const color = percentage === 100 ? theme.status.success : theme.accent.default;
  const textSize = size <= 56 ? typography.label : typography.caption;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cx} r={r} fill="none" stroke={theme.accent.track} strokeWidth={stroke} />
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </Svg>
      {showText ? (
        <Text style={{ position: 'absolute', color: theme.text.primary, fontSize: textSize, fontFamily: fonts.mono.bold }}>
          {percentage}%
        </Text>
      ) : null}
    </View>
  );
}
