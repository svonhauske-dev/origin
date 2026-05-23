import { useState } from 'react';
import {
  signInPassword,
  signUp,
  dbCreateProfile,
  requestPasswordReset,
  updatePassword,
  getSession,
} from '../lib/api';
import { spacing, typography, layout, touch, icon } from '../design-system';
import { useTheme } from '../lib/theme';
import Button from './Button';
import Checkbox from './Checkbox';
import Input from './Input';
import Label from './Label';
import InlineLoader from './InlineLoader';
import OriginGlyph from './OriginGlyph';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { label: "8+ characters",     test: p => p.length >= 8 },
  { label: "Uppercase letter",  test: p => /[A-Z]/.test(p) },
  { label: "Number",            test: p => /[0-9]/.test(p) },
  { label: "Special character", test: p => /[^A-Za-z0-9]/.test(p) },
];

function PasswordRule({ met, label }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xxs }}>
      <Checkbox checked={met} size={icon.xs} shape="pill" />
      <span style={{ fontSize: typography.label, color: met ? theme.text.primary : theme.text.secondary, transition: "color 150ms" }}>{label}</span>
    </div>
  );
}

const COPY = {
  signin:         { title: "Welcome back",     sub: "Pick up where you left off" },
  signup:         { title: "Hello",            sub: "Let's set up your protocol" },
  reset_request:  { title: "Reset password",   sub: "We'll email you a link to set a new one" },
  reset_sent:     { title: "Check your email", sub: "If an account exists for that email, we sent a reset link. The link opens Origin and lets you choose a new password." },
  reset_confirm:  { title: "Set a new password", sub: "Almost done — choose a new password to sign in with." },
};

export default function Auth({ onSignIn, recoveryMode = false }) {
  const { theme } = useTheme();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPw, setConfirmPw]       = useState("");
  const [name, setName]                 = useState("");
  const [nameTouched, setNameTouched]   = useState(false);
  const [mode, setMode]                 = useState(recoveryMode ? "reset_confirm" : "signin");
  const [loading, setLoading]           = useState(false);
  const [msg, setMsg]                   = useState("");

  const emailOk   = EMAIL_RE.test(email.trim());
  const rulesOk   = PASSWORD_RULES.every(r => r.test(password));
  const pwMatch   = password === confirmPw;

  const canSubmit = !loading && (
    mode === "signin"        ? emailOk && password.length > 0 :
    mode === "signup"        ? name.trim().length > 0 && emailOk && rulesOk :
    mode === "reset_request" ? emailOk :
    mode === "reset_confirm" ? rulesOk && pwMatch :
    false
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setMsg("");
    try {
      if (mode === "signin") {
        const { user } = await signInPassword(email.trim(), password);
        onSignIn(user);
        return;
      }
      if (mode === "signup") {
        const { user, session } = await signUp(email.trim(), password);
        try { await dbCreateProfile({ id: user.id, display_name: name.trim() || null }, session.access_token); } catch {}
        onSignIn(user);
        return;
      }
      if (mode === "reset_request") {
        await requestPasswordReset(email.trim(), window.location.origin);
        setLoading(false);
        setMode("reset_sent");
        return;
      }
      if (mode === "reset_confirm") {
        // Recovery token is already in localStorage (App.jsx set it from the URL
        // hash on mount). Use it to update the password, then promote to a real
        // signed-in session.
        const tok = localStorage.getItem("sb_token") || "";
        await updatePassword(password, tok);
        const user = await getSession();
        if (!user) throw new Error("SESSION_LOST");
        onSignIn(user);
        return;
      }
    } catch (err) {
      setLoading(false);
      if (err.message === "EMAIL_TAKEN") {
        setMsg("EMAIL_TAKEN");
      } else if (err instanceof TypeError || err.message?.includes("fetch") || err.message?.includes("Failed to fetch") || err.message?.includes("network")) {
        setMsg("Couldn't reach Origin. Check your connection.");
      } else if (mode === "signin") {
        setMsg("Email or password is incorrect.");
      } else if (mode === "reset_request") {
        setMsg("Couldn't send the reset link. Try again in a moment.");
      } else if (mode === "reset_confirm") {
        setMsg("Couldn't reset your password. The link may have expired — request a new one.");
      } else {
        setMsg("Something went wrong. Try again.");
      }
    }
  };

  const goTo = (next) => {
    setMode(next);
    setMsg("");
    setPassword("");
    setConfirmPw("");
  };

  const copy = COPY[mode];

  return (
    <div style={{ fontFamily: typography.fontBody, background: theme.gradients.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: spacing.md }}>
      <div style={{ width: "100%", maxWidth: layout.signInWidth, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: spacing.md }}>
          <OriginGlyph size={56} />
        </div>
        <div style={{
          fontSize: typography.heading,
          fontWeight: typography.bold,
          fontFamily: typography.fontHeading,
          letterSpacing: typography.labelSpacingWide,
          textTransform: 'uppercase',
          color: theme.text.primary,
          marginBottom: spacing.lg,
        }}>Origin</div>
        <h1 style={{ fontSize: typography.display, fontWeight: typography.bold, color: theme.text.primary, letterSpacing: typography.headingLetterSpacing, margin: 0, marginBottom: spacing.xs }}>
          {copy.title}
        </h1>
        <div style={{ fontSize: typography.caption, color: theme.text.secondary, marginBottom: spacing.xl, lineHeight: 1.5 }}>
          {copy.sub}
        </div>

        {/* reset_sent has no form — just the explainer + back-to-sign-in link */}
        {mode === "reset_sent" ? (
          <button
            type="button"
            onClick={() => goTo("signin")}
            style={{ marginTop: spacing.md, background: "none", border: "none", color: theme.text.secondary, fontSize: typography.caption, cursor: "pointer", WebkitTapHighlightColor: "transparent", minHeight: touch.min, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}
          >
            Back to sign in
          </button>
        ) : (
          <>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {mode === "signup" && (
                <div style={{ marginBottom: spacing.md, textAlign: "left" }}>
                  <Label htmlFor="auth-name">Full name</Label>
                  <Input
                    id="auth-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    autoCapitalize="words"
                    value={name}
                    onChange={e => { setName(e.target.value); setMsg(""); }}
                    onBlur={() => setNameTouched(true)}
                    placeholder="e.g. Sofia von Hauske"
                  />
                  {nameTouched && !name.trim() && (
                    <div style={{ fontSize: typography.label, color: theme.status.danger, marginTop: spacing.xxxs }}>Full name is required</div>
                  )}
                </div>
              )}

              {/* Email input — hidden on reset_confirm (we already have the user via the recovery token) */}
              {mode !== "reset_confirm" && (
                <div style={{ marginBottom: spacing.md, textAlign: "left" }}>
                  <Label htmlFor="auth-email">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setMsg(""); }}
                    placeholder="your@email.com"
                  />
                </div>
              )}

              {/* Password input — hidden on reset_request (email-only) */}
              {mode !== "reset_request" && (
                <div style={{ marginBottom: (mode === "signup" || mode === "reset_confirm") ? spacing.xs : spacing.md, textAlign: "left" }}>
                  <Label htmlFor="auth-password">{mode === "reset_confirm" ? "New password" : "Password"}</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    name="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setMsg(""); }}
                    placeholder="password"
                  />
                </div>
              )}

              {/* Confirm-password — only on reset_confirm */}
              {mode === "reset_confirm" && (
                <div style={{ marginBottom: spacing.xs, textAlign: "left" }}>
                  <Label htmlFor="auth-password-confirm">Confirm new password</Label>
                  <Input
                    id="auth-password-confirm"
                    type="password"
                    name="confirm-password"
                    autoComplete="new-password"
                    value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); setMsg(""); }}
                    placeholder="confirm password"
                  />
                  {confirmPw && !pwMatch && (
                    <div style={{ fontSize: typography.label, color: theme.status.danger, marginTop: spacing.xxxs }}>Passwords don't match</div>
                  )}
                </div>
              )}

              {/* Password rules — only on signup + reset_confirm */}
              {(mode === "signup" || mode === "reset_confirm") && (
                <div style={{ marginBottom: spacing.md, textAlign: "left" }}>
                  {PASSWORD_RULES.map(r => <PasswordRule key={r.label} label={r.label} met={r.test(password)} />)}
                </div>
              )}

              <Button variant="primary" fullWidth type="submit" disabled={!canSubmit}>
                {loading ? <InlineLoader size="sm" /> : (
                  mode === "signin"        ? "Sign in" :
                  mode === "signup"        ? "Create account" :
                  mode === "reset_request" ? "Send reset link" :
                  mode === "reset_confirm" ? "Reset password" :
                  ""
                )}
              </Button>

              {/* Forgot-password link — only on signin */}
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => goTo("reset_request")}
                  style={{ marginTop: spacing.sm, background: "none", border: "none", color: theme.text.secondary, fontSize: typography.label, cursor: "pointer", padding: 0, WebkitTapHighlightColor: "transparent", textDecoration: "underline" }}
                >
                  Forgot password?
                </button>
              )}

              {msg === "EMAIL_TAKEN" ? (
                <div style={{ marginTop: spacing.md, fontSize: typography.caption, color: theme.status.danger }}>
                  That email is already registered.{" "}
                  <button
                    type="button"
                    onClick={() => goTo("signin")}
                    style={{ background: "none", border: "none", color: theme.accent.default, fontSize: typography.caption, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                  >
                    Sign in instead?
                  </button>
                </div>
              ) : msg ? (
                <div style={{ marginTop: spacing.md, fontSize: typography.caption, color: theme.status.danger }}>{msg}</div>
              ) : null}
            </form>

            {/* Mode switcher — hidden on reset_confirm (one-way path from email link) */}
            {mode !== "reset_confirm" && (
              <button
                type="button"
                onClick={() => goTo(
                  mode === "signin"        ? "signup" :
                  mode === "signup"        ? "signin" :
                  mode === "reset_request" ? "signin" :
                  "signin"
                )}
                style={{ marginTop: spacing.md, background: "none", border: "none", color: theme.text.secondary, fontSize: typography.caption, cursor: "pointer", WebkitTapHighlightColor: "transparent", minHeight: touch.min, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}
              >
                {mode === "signin"        ? "New to Origin? Sign up" :
                 mode === "signup"        ? "Already have an account? Sign in" :
                 mode === "reset_request" ? "Back to sign in" :
                 ""}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
