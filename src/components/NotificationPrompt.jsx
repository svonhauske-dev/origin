import { spacing, typography, layout } from "../design-system";
import { useTheme } from "../lib/theme";
import { needsHomeScreenInstall } from "../lib/notifications";
import Button from "./Button";
import OriginGlyph from "./OriginGlyph";

export default function NotificationPrompt({ onEnable, onSkip }) {
  const { theme } = useTheme();
  const installRequired = needsHomeScreenInstall();

  const screenStyle = {
    fontFamily: typography.fontBody,
    background: theme.gradients.bg,
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: `max(${spacing.xl}px, env(safe-area-inset-top)) ${spacing.md}px max(${spacing.xl}px, env(safe-area-inset-bottom))`,
    WebkitFontSmoothing: "antialiased",
  };

  const headingStyle = {
    fontSize: typography.heading,
    fontWeight: typography.semibold,
    color: theme.text.primary,
    fontFamily: typography.fontHeading,
    marginBottom: spacing.xs,
  };

  const bodyStyle = {
    fontSize: typography.caption,
    color: theme.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 1.5,
  };

  // iOS in Safari (non-PWA): can't subscribe to push until Origin is installed
  // to the home screen. Show install instructions; user will return on next
  // launch from the PWA and can enable reminders in Settings.
  if (installRequired) {
    return (
      <div style={screenStyle}>
        <div style={{ width: "100%", maxWidth: layout.maxContentWidth }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: spacing.md }}>
            <OriginGlyph size={56} />
          </div>
          <div style={headingStyle}>Add Origin to your home screen</div>
          <div style={bodyStyle}>
            Reminders on iOS need Origin installed to your home screen. Once it's installed, open Origin from there and turn on reminders in Settings.
          </div>
          <ol style={{
            paddingLeft: spacing.lg,
            color: theme.text.secondary,
            lineHeight: 1.8,
            fontSize: typography.body,
            marginBottom: spacing.xl,
          }}>
            <li>Tap the Share button in Safari</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Open Origin from your home screen</li>
            <li>Open Settings and turn on reminders</li>
          </ol>
          <Button variant="primary" fullWidth onClick={onSkip}>
            Got it
          </Button>
        </div>
      </div>
    );
  }

  // Default: push is supportable in this browser session — offer the toggle.
  return (
    <div style={screenStyle}>
      <div style={{ width: "100%", maxWidth: layout.maxContentWidth }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: spacing.md }}>
          <OriginGlyph size={56} />
        </div>
        <div style={headingStyle}>Want reminders?</div>
        <div style={bodyStyle}>
          Origin can ping you when it's time to take your medication and supplements. You can change this any time in Settings.
        </div>
        <Button variant="primary" fullWidth onClick={onEnable} style={{ marginBottom: spacing.sm }}>
          Enable reminders
        </Button>
        <Button variant="tertiary" fullWidth onClick={onSkip}>
          Maybe later
        </Button>
      </div>
    </div>
  );
}
