import { useTheme } from '../lib/theme';

const CONFIGS = {
  sm: { size: 20, cx: 10, dotR: 2,   waveR: 3,  waveEnd: 9,  waves: 2, cycle: 1.6, stagger: 0.55 },
  md: { size: 32, cx: 16, dotR: 2.5, waveR: 5,  waveEnd: 14, waves: 3, cycle: 2,   stagger: 0.55 },
};

export default function InlineLoader({ size = "md" }) {
  const { theme } = useTheme();
  const cfg = CONFIGS[size] ?? CONFIGS.md;
  const { size: sz, cx, dotR, waveR, waveEnd, waves, cycle, stagger } = cfg;
  const animName = `inlineWave_${size}`;
  const dotAnim  = `inlineDot_${size}`;

  return (
    <>
      <style>{`
        @keyframes ${animName} {
          0%   { r: ${waveR};   opacity: 1;   stroke-width: ${size === "sm" ? 1 : 1.2}; }
          100% { r: ${waveEnd}; opacity: 0;   stroke-width: 0.3; }
        }
        @keyframes ${dotAnim} {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
      `}</style>
      <svg
        width={sz}
        height={sz}
        viewBox={`0 0 ${sz} ${sz}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", flexShrink: 0 }}
      >
        {Array.from({ length: waves }, (_, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cx}
            r={waveR}
            stroke={theme.text.primary}
            fill="none"
            style={{
              animation: `${animName} ${cycle}s ${i * stagger}s ease-out infinite`,
              opacity: 0,
            }}
          />
        ))}
        <circle
          cx={cx}
          cy={cx}
          r={dotR}
          fill={theme.text.primary}
          style={{ animation: `${dotAnim} ${cycle}s ease-in-out infinite` }}
        />
      </svg>
    </>
  );
}
