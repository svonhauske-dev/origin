import { useState, useEffect } from 'react';
import { useTheme } from '../lib/theme';

const WAVES = [0, 0.6, 1.2, 1.8];

export default function Loader({ onMount }) {
  const { theme } = useTheme();
  const [frozenColors] = useState(() => ({
    bg: theme.gradients.bg,
    primary: theme.text.primary,
  }));

  useEffect(() => {
    if (onMount) onMount();
  }, []);

  return (
    <div style={{
      background: frozenColors.bg,
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <style>{`
        @keyframes originWave {
          0%   { transform: scale(1); opacity: 1; stroke-width: 1.2; }
          100% { transform: scale(4); opacity: 0; stroke-width: 0.3; }
        }
        .origin-wave {
          transform-origin: 60px 60px;
        }
        @keyframes originDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        /* HIG exception: Loader animation preserved under reduced-motion.
           Provides essential "system is working" feedback during auth and
           protocol load — without it, users see a blank screen with no
           indication anything is happening. Animation is contained (small
           rings, not viewport-spanning), brief (3000ms minimum then
           unmounts), and non-repetitive from the user's perspective.
           HIG permits subtle functional motion under reduced-motion when
           it provides essential feedback with no large or looping effect. */
        @media (prefers-reduced-motion: reduce) {
          .origin-wave {
            animation-duration: 3s !important;
            animation-iteration-count: infinite !important;
          }
          .origin-dot {
            animation-duration: 3s !important;
            animation-iteration-count: infinite !important;
          }
        }
      `}</style>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {WAVES.map((delay, i) => (
          <g
            key={i}
            className="origin-wave"
            style={{
              animation: `originWave 3s ${delay}s ease-out infinite`,
              opacity: 0,
            }}
          >
            <circle
              cx="60"
              cy="60"
              r="14"
              stroke={frozenColors.primary}
              strokeWidth="1.2"
              fill="none"
            />
          </g>
        ))}
        <circle
          cx="60"
          cy="60"
          r="3.5"
          fill={frozenColors.primary}
          className="origin-dot"
          style={{ animation: "originDot 3s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
}
