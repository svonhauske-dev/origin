import { useState, useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { spacing, typography, touch, layout, icon, motion } from '../design-system';
import { useTheme } from '../lib/theme';
import { useToast } from './ToastContext';
import Button from './Button';
import Checkbox from './Checkbox';
import Heading from './Heading';
import Input from './Input';
import Label from './Label';
import HelperText from './HelperText';
import Row from './Row';
import InlineLoader from './InlineLoader';
import {
  isPushSupported, needsHomeScreenInstall, getNotificationPermission,
  getCurrentSubscription, subscribeToPush, unsubscribeFromPush,
} from '../lib/notifications';
import { dbUpdateScheduleField, dbUpdateProfile, updateEmail, updatePassword } from '../lib/api';
import { calculateProtocolAdherence, getUpcomingEndings, getCurrentProtocolAge } from '../lib/adherence';
import ScheduleTab from './ScheduleTab';
import Modal from './Modal';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { label: '8+ characters',     test: p => p.length >= 8 },
  { label: 'Uppercase letter',  test: p => /[A-Z]/.test(p) },
  { label: 'Number',            test: p => /[0-9]/.test(p) },
  { label: 'Special character', test: p => /[^A-Za-z0-9]/.test(p) },
];

function PasswordRule({ met, label }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xxs }}>
      <Checkbox checked={met} size={icon.xs} shape="pill" />
      <span style={{ fontSize: typography.label, color: met ? theme.text.primary : theme.text.secondary, transition: 'color 150ms' }}>
        {label}
      </span>
    </div>
  );
}

const TITLES = { main: 'Settings', schedule: 'Schedule', account: 'Account', install: 'Add to home screen', insights: 'Insights' };

export default function SettingsScreen({ isOpen, onBack, onSignOut, user, token, profile, onProfileUpdate, onNotificationsEnabled, scheduleMode, scheduleConfig, anchorBehavior, consistentTime, onSaveSchedule, supplements = [], protocols = [], weekLogs = [], desktop = false }) {
  const { theme } = useTheme();
  const { show: showToast } = useToast();

  const [view, setView] = useState('main');
  // renderedSubView lags behind `view`: it captures the most recent non-main
  // view so its content stays mounted during the slide-out animation back
  // to main. Without it, going back would unmount the sub-view content
  // instantly and the slide would animate an empty container.
  const [renderedSubView, setRenderedSubView] = useState(null);

  const goToSubView = (v) => {
    setRenderedSubView(v);
    setView(v);
  };

  // Notification state
  const [permission, setPermission]           = useState('default');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [needsInstall, setNeedsInstall]       = useState(false);
  const [pushSupported, setPushSupported]     = useState(true);
  const [toggling, setToggling]               = useState(false);

  // Account — display name
  const [displayName, setDisplayName] = useState('');
  const [nameSaving, setNameSaving]   = useState(false);
  const debounceRef = useRef(null);

  // Account — email
  const [newEmail, setNewEmail]       = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg]       = useState('');

  // Account — password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [pwSaving, setPwSaving]       = useState(false);

  // Sign-out confirmation
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setView('main');
    setRenderedSubView(null);
    setPermission(getNotificationPermission());
    setNeedsInstall(needsHomeScreenInstall());
    setPushSupported(isPushSupported());
    getCurrentSubscription().then(sub => setHasSubscription(!!sub));
    setDisplayName(profile?.display_name || '');
  }, [isOpen]);

  useEffect(() => {
    setDisplayName(profile?.display_name || '');
  }, [profile?.display_name]);

  const handleBack = () => {
    if (view !== 'main') setView('main');
    else onBack();
  };

  const handleDisplayNameChange = (e) => {
    const val = e.target.value;
    setDisplayName(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (val.trim() === (profile?.display_name || '')) return;
      setNameSaving(true);
      try {
        await dbUpdateProfile(user.id, { display_name: val.trim() || null, updated_at: new Date().toISOString() }, token);
        onProfileUpdate({ ...profile, display_name: val.trim() || null });
        showToast('Name updated');
      } catch {
        showToast("Couldn't save — try again");
      } finally {
        setNameSaving(false);
      }
    }, 600);
  };

  const handleSaveEmail = async () => {
    setEmailMsg('');
    if (!EMAIL_RE.test(newEmail.trim())) { setEmailMsg('Enter a valid email address'); return; }
    setEmailSaving(true);
    try {
      await updateEmail(newEmail.trim(), token);
      setNewEmail('');
      showToast('Check your inbox to confirm the new email');
    } catch {
      setEmailMsg("Couldn't update email — try again");
    } finally {
      setEmailSaving(false);
    }
  };

  const pwRulesOk = PASSWORD_RULES.every(r => r.test(newPassword));
  const pwMatch   = newPassword.length > 0 && confirmPw.length > 0 && newPassword === confirmPw;

  const handleSavePassword = async () => {
    if (!pwRulesOk || !pwMatch) return;
    setPwSaving(true);
    try {
      await updatePassword(newPassword, token);
      setNewPassword('');
      setConfirmPw('');
      showToast('Password updated');
    } catch {
      showToast("Couldn't update password — try again");
    } finally {
      setPwSaving(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      if (hasSubscription) {
        await unsubscribeFromPush();
        await dbUpdateScheduleField('notifications_enabled', false, user.id, token);
        setHasSubscription(false);
        showToast('Reminders off');
      } else {
        if (needsInstall) { setToggling(false); setView('install'); return; }
        await subscribeToPush();
        await dbUpdateScheduleField('notifications_enabled', true, user.id, token);
        setPermission('granted');
        setHasSubscription(true);
        showToast('Reminders on');
        if (onNotificationsEnabled) onNotificationsEnabled();
      }
    } catch (err) {
      if (err.message?.includes('denied')) {
        showToast('Permission denied — enable in device settings');
        setPermission('denied');
      } else if (err.message?.includes('PWA install')) {
        goToSubView('install');
      } else if (err.message?.includes('VAPID')) {
        showToast('Reminders not configured yet');
      } else {
        showToast("Couldn't update reminders");
      }
    } finally {
      setToggling(false);
    }
  };

  const divider = (
    <div style={{ borderTop: `${theme.borderWidth.default}px solid ${theme.border.subtle}`, margin: `${spacing.lg}px 0` }} />
  );

  // Shared layer header — back chevron + title. Each sliding layer mounts
  // its own copy so the title swap is visually tied to the layer that's
  // entering/leaving.
  const LayerHeader = ({ title }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: desktop
        ? `${spacing.md}px ${spacing.md}px ${spacing.sm}px`
        : `max(20px, env(safe-area-inset-top)) ${spacing.md}px ${spacing.sm}px`,
      background: desktop ? theme.surface.card : theme.surface.canvas,
      borderBottom: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
      position: 'sticky', top: 0, zIndex: 1,
    }}>
      <Button variant="icon" aria-label="Back" onClick={handleBack}>
        <ChevronLeft size={18} />
      </Button>
      <h1 style={{ fontSize: typography.body, fontWeight: typography.semibold, color: theme.text.primary, margin: 0 }}>
        {title}
      </h1>
      <div style={{ width: touch.min }} />
    </div>
  );

  const contentInnerStyle = {
    maxWidth: desktop ? 'none' : layout.maxContentWidth,
    width: '100%',
    margin: '0 auto',
    padding: desktop
      ? `${spacing.lg}px ${spacing.md}px ${spacing.md}px`
      : `${spacing.lg}px ${spacing.md}px max(80px, env(safe-area-inset-bottom))`,
  };

  // Both layers are absolutely positioned inside the panel and scroll
  // independently. Sub-layer translates from +100% → 0 entering and back
  // to +100% on the way out, mirroring the iOS push-nav pattern. The outer
  // panel sets overflow: hidden so the off-screen sub-layer is clipped
  // rather than escaping.
  const layerBaseStyle = {
    position: 'absolute',
    inset: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    background: desktop ? theme.surface.card : theme.surface.canvas,
  };
  const subLayerStyle = {
    ...layerBaseStyle,
    transform: view === 'main' ? 'translateX(100%)' : 'translateX(0)',
    transition: `transform ${motion.screenSlide}ms ease-out`,
    zIndex: 2,
  };

  return (
    <div style={desktop ? {
      position: 'relative',
      width: '100%',
      height: '100%',
      background: theme.surface.card,
      overflow: 'hidden',
    } : {
      position: 'fixed',
      // Centered phone-frame on desktop (≥1024px). 100vw closed-state shift
      // ensures fully off-screen regardless of viewport. See
      // ProtocolDetailScreen for the same pattern.
      top: 0, left: '50%', bottom: 0,
      width: 'min(440px, 100vw)',
      transform: isOpen ? 'translateX(-50%)' : 'translateX(100vw)',
      transition: `transform ${motion.screenSlide}ms ease-out`,
      zIndex: 100,
      background: theme.surface.canvas,
      overflow: 'hidden',
    }}>
      {/* ───── Main layer ───── */}
      <div style={layerBaseStyle} aria-hidden={view !== 'main'}>
        <LayerHeader title={TITLES.main} />
        <div style={contentInnerStyle}>
          <>
            <Heading level={2} visual="label" style={{ marginBottom: spacing.xs }}>Schedule</Heading>
            <Row
              onClick={() => goToSubView('schedule')}
              ariaLabel="Edit schedule"
              leftContent={
                <span style={{ fontSize: typography.body, color: theme.text.secondary }}>
                  Edit schedule
                </span>
              }
            />

            {divider}

            <Heading level={2} visual="label" style={{ marginBottom: spacing.xs }}>Account</Heading>
            <Row
              onClick={() => goToSubView('account')}
              ariaLabel="Edit account"
              leftContent={
                <span style={{ fontSize: typography.body, color: theme.text.secondary }}>
                  Edit account
                </span>
              }
            />

            {/* DEV-ONLY: insights nav row (prototype). vercel.json pins `vite
                build` so import.meta.env.DEV is reliably false in production. */}
            {import.meta.env.DEV && (
              <>
                {divider}
                <Heading level={2} visual="label" style={{ marginBottom: spacing.xs }}>Insights</Heading>
                <Row
                  onClick={() => goToSubView('insights')}
                  ariaLabel="Adherence and upcoming changes"
                  leftContent={
                    <span style={{ fontSize: typography.body, color: theme.text.secondary }}>
                      Adherence + upcoming changes
                    </span>
                  }
                />
              </>
            )}

            {divider}

            {/* Notifications */}
            <Heading level={2} visual="label" style={{ marginBottom: spacing.xs }}>Notifications</Heading>
            {!pushSupported ? (
              <HelperText>Notifications aren't supported in this browser.</HelperText>
            ) : needsInstall ? (
              <Row
                onClick={() => goToSubView('install')}
                ariaLabel="Install Origin to enable reminders"
                leftContent={
                  <span style={{ fontSize: typography.caption, color: theme.text.secondary, flex: 1, paddingRight: spacing.sm }}>
                    Install Origin to your home screen to enable reminders.
                  </span>
                }
              />
            ) : (
              <>
                <div style={{ display: 'flex', gap: spacing.xs }}>
                  <Button variant="selector" active={hasSubscription}  disabled={toggling || permission === 'denied'} style={{ flex: 1 }} onClick={() => { if (!hasSubscription) handleToggleNotifications(); }}>On</Button>
                  <Button variant="selector" active={!hasSubscription} disabled={toggling} style={{ flex: 1 }} onClick={() => { if (hasSubscription) handleToggleNotifications(); }}>Off</Button>
                </div>
                {toggling && <HelperText style={{ marginTop: spacing.xxs }}>Updating…</HelperText>}
                {permission === 'denied' && <div style={{ fontSize: typography.caption, color: theme.status.danger, marginTop: spacing.xxs }}>Notifications blocked. Enable Origin in your device settings.</div>}
                {!hasSubscription && !toggling && permission === 'default' && <HelperText style={{ marginTop: spacing.xxs }}>You'll be asked to allow notifications.</HelperText>}
                {!hasSubscription && !toggling && permission === 'granted'  && <HelperText style={{ marginTop: spacing.xxs }}>Tap On to resume notifications.</HelperText>}
              </>
            )}

            {divider}

            <Button variant="secondary" fullWidth onClick={() => setShowSignOutConfirm(true)}>Sign out</Button>
          </>
        </div>
      </div>

      {/* ───── Sub-view layer ───── */}
      <div style={subLayerStyle} aria-hidden={view === 'main'}>
        <LayerHeader title={TITLES[renderedSubView] || ''} />
        <div style={contentInnerStyle}>

        {/* ── Schedule view ── */}
        {renderedSubView === 'schedule' && (
          <ScheduleTab
            scheduleMode={scheduleMode}
            scheduleConfig={scheduleConfig}
            anchorBehavior={anchorBehavior}
            consistentTime={consistentTime}
            onSave={onSaveSchedule}
            supplements={supplements}
          />
        )}

        {/* ── Account view ── */}
        {renderedSubView === 'account' && (
          <>
            <div style={{ marginBottom: spacing.md }}>
              <Label style={{ marginBottom: spacing.xxs, fontSize: typography.caption, color: theme.text.secondary }}>Full name</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  value={displayName}
                  onChange={handleDisplayNameChange}
                  placeholder="e.g. Sofia von Hauske"
                  autoComplete="name"
                />
                {nameSaving && (
                  <div style={{ position: 'absolute', right: spacing.sm, top: '50%', transform: 'translateY(-50%)' }}>
                    <InlineLoader size="sm" />
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSaveEmail(); }} style={{ marginBottom: spacing.md }}>
              <Label style={{ marginBottom: spacing.xxs, fontSize: typography.caption, color: theme.text.secondary }}>Email</Label>
              <div style={{ fontSize: typography.caption, color: theme.text.secondary, marginBottom: spacing.xs }}>{user.email}</div>
              <Input
                type="email"
                value={newEmail}
                onChange={e => { setNewEmail(e.target.value); setEmailMsg(''); }}
                placeholder="New email address"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                style={{ marginBottom: spacing.xs }}
              />
              {emailMsg && <div style={{ fontSize: typography.label, color: theme.status.danger, marginBottom: spacing.xs }}>{emailMsg}</div>}
              <Button variant="secondary" fullWidth type="submit" disabled={emailSaving || !newEmail.trim()}>
                {emailSaving ? <InlineLoader size="sm" /> : 'Update email'}
              </Button>
            </form>

            <form onSubmit={e => { e.preventDefault(); handleSavePassword(); }}>
              <Label style={{ marginBottom: spacing.xxs, fontSize: typography.caption, color: theme.text.secondary }}>Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" autoComplete="new-password" style={{ marginBottom: spacing.xs }} />
              <Input type="password" value={confirmPw}   onChange={e => setConfirmPw(e.target.value)}   placeholder="Confirm new password" autoComplete="new-password" style={{ marginBottom: spacing.xs }} />
              {confirmPw && !pwMatch && <div style={{ fontSize: typography.label, color: theme.status.danger, marginBottom: spacing.xs }}>Passwords don't match</div>}
              <div style={{ marginBottom: spacing.xs }}>
                {PASSWORD_RULES.map(r => <PasswordRule key={r.label} label={r.label} met={r.test(newPassword)} />)}
              </div>
              <Button variant="secondary" fullWidth type="submit" disabled={pwSaving || !pwRulesOk || !pwMatch}>
                {pwSaving ? <InlineLoader size="sm" /> : 'Update password'}
              </Button>
            </form>
          </>
        )}

        {/* ── Install view ── */}
        {renderedSubView === 'install' && (
          <div style={{ paddingTop: spacing.xs }}>
            <p style={{ fontSize: typography.body, color: theme.text.secondary, marginBottom: spacing.md, lineHeight: 1.6 }}>
              To enable reminders on iOS, Origin must be installed to your home screen.
            </p>
            <ol style={{ paddingLeft: spacing.lg, color: theme.text.secondary, lineHeight: 1.8, fontSize: typography.body }}>
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Open Origin from your home screen</li>
              <li>Return to Settings and enable reminders</li>
            </ol>
          </div>
        )}

        {/* ── Insights view (DEV-ONLY prototype) ── */}
        {import.meta.env.DEV && renderedSubView === 'insights' && (() => {
          // For the prototype we treat "your" adherence as the first active
          // protocol's adherence — for the common 1-protocol case that's exact;
          // multi-protocol users get a partial picture for now.
          const active = protocols.filter(p => p.status === 'active')[0];
          const adh7  = active ? calculateProtocolAdherence(active, supplements, weekLogs, null, 7)  : null;
          const adh30 = active ? calculateProtocolAdherence(active, supplements, weekLogs, null, 30) : null;
          const protoAge = getCurrentProtocolAge(protocols);
          const endings = getUpcomingEndings(supplements, 14);
          const hasAny = adh7 || adh30 || protoAge || endings.length > 0;

          if (!hasAny) {
            return (
              <HelperText>Not enough data yet. Insights appear as you build a history.</HelperText>
            );
          }

          const labelStyle = {
            fontSize: typography.label,
            color: theme.text.muted,
            fontFamily: typography.fontHeading,
            fontWeight: typography.semibold,
            letterSpacing: typography.labelSpacingWide,
            textTransform: 'uppercase',
            marginBottom: spacing.xxxs,
          };
          const numStyle = {
            fontSize: typography.display,
            fontWeight: typography.bold,
            color: theme.text.primary,
            fontFamily: typography.fontData,
            letterSpacing: typography.headingLetterSpacing,
            lineHeight: 1,
          };

          return (
            <>
              {(adh7 || adh30) && (
                <>
                  <Heading level={2} visual="label" style={{ marginBottom: spacing.sm }}>Adherence</Heading>
                  <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.md }}>
                    <div style={{ flex: 1 }}>
                      <div style={labelStyle}>Last 7 days</div>
                      <div style={numStyle}>{adh7 ? `${adh7.pct}%` : '—'}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={labelStyle}>Last 30 days</div>
                      <div style={numStyle}>{adh30 ? `${adh30.pct}%` : '—'}</div>
                    </div>
                  </div>
                </>
              )}

              {protoAge && (
                <>
                  {divider}
                  <Heading level={2} visual="label" style={{ marginBottom: spacing.xs }}>Protocol</Heading>
                  <div style={{ fontSize: typography.body, color: theme.text.primary, marginBottom: spacing.md }}>
                    Day{' '}
                    <span style={{ fontFamily: typography.fontData, fontWeight: typography.semibold }}>
                      {protoAge.ageDays}
                    </span>
                    {' '}of {protoAge.protocol.name}
                  </div>
                </>
              )}

              {endings.length > 0 && (
                <>
                  {divider}
                  <Heading level={2} visual="label" style={{ marginBottom: spacing.xs }}>Coming up</Heading>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {endings.map((s, i) => {
                      const [y, m, dd] = s.ends_at.split('-').map(Number);
                      const endDate = new Date(y, m - 1, dd);
                      const formatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return (
                        <div key={s.id} style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          padding: `${spacing.xs}px 0`,
                          borderBottom: i < endings.length - 1
                            ? `${theme.borderWidth.default}px solid ${theme.border.subtle}`
                            : 'none',
                        }}>
                          <span style={{ fontSize: typography.body, color: theme.text.primary }}>
                            {s.name}
                          </span>
                          <span style={{
                            fontFamily: typography.fontData,
                            fontSize: typography.caption,
                            color: theme.text.secondary,
                          }}>
                            {formatted}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          );
        })()}

        </div>
      </div>

      <Modal
        open={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Sign out of Origin?"
        footer={
          <div style={{ display: 'flex', gap: spacing.xs }}>
            <Button variant="secondary" fullWidth onClick={() => setShowSignOutConfirm(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={() => { setShowSignOutConfirm(false); onSignOut?.(); }}>Sign out</Button>
          </div>
        }
      >
        <div style={{ fontSize: typography.body, color: theme.text.secondary, lineHeight: 1.5 }}>
          You'll need to sign in again to access your protocol. Your data stays safe.
        </div>
      </Modal>
    </div>
  );
}
