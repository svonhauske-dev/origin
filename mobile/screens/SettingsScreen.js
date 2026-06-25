import { useState, useRef } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { dbUpdateProfile, updateEmail, updatePassword } from 'shared/lib/api';
import { Heading, Label, Text, Button, Row, Input, Checkbox } from '../components';
import InlineLoader from '../components/InlineLoader';
import Modal from '../components/Modal';
import ScheduleTab from './ScheduleTab';
import { theme, spacing, typography, touch, icon } from '../theme';

// RN port of src/components/SettingsScreen.jsx (batch 1): Main + Account views +
// sign-out confirm. Schedule sub-view (ScheduleTab) and Notifications (push =
// Phase 5) are deferred. Toasts deferred — success is silent, errors inline.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RULES = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Number', test: (p) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordRule({ met, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xxs }}>
      <Checkbox checked={met} size={icon.xs} shape="pill" />
      <Text size="label" tone={met ? 'primary' : 'secondary'}>{label}</Text>
    </View>
  );
}

const TITLES = { main: 'Settings', account: 'Account', schedule: 'Schedule' };

export default function SettingsScreen({
  user, token, profile, onProfileUpdate, onSignOut, onBack,
  scheduleMode, scheduleConfig, anchorBehavior, consistentTime, adaptiveEnabled = false, onSaveSchedule, supplements = [],
  remindersEnabled = false, onToggleReminders,
}) {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState('main');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const debounceRef = useRef(null);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleBack = () => { if (view !== 'main') setView('main'); else onBack(); };

  const handleDisplayNameChange = (val) => {
    setDisplayName(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (val.trim() === (profile?.display_name || '')) return;
      setNameSaving(true);
      try {
        await dbUpdateProfile(user.id, { display_name: val.trim() || null, updated_at: new Date().toISOString() }, token);
        onProfileUpdate?.({ ...profile, display_name: val.trim() || null });
      } catch {
        // keep silent — name re-saves on next edit
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
      setEmailMsg('Check your inbox to confirm the new email.');
    } catch {
      setEmailMsg("Couldn't update email — try again");
    } finally {
      setEmailSaving(false);
    }
  };

  const pwRulesOk = PASSWORD_RULES.every((r) => r.test(newPassword));
  const pwMatch = newPassword.length > 0 && confirmPw.length > 0 && newPassword === confirmPw;
  const handleSavePassword = async () => {
    if (!pwRulesOk || !pwMatch) return;
    setPwSaving(true);
    try {
      await updatePassword(newPassword, token);
      setNewPassword('');
      setConfirmPw('');
    } catch {
      // surfaced via disabled state; toast deferred
    } finally {
      setPwSaving(false);
    }
  };

  const Divider = () => <View style={{ borderTopWidth: theme.borderWidth.default, borderTopColor: theme.border.subtle, marginVertical: spacing.md }} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface.canvas }}>
      {/* Layer header — back chevron + title */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: Math.max(insets.top, 20),
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
          borderBottomWidth: theme.borderWidth.default,
          borderBottomColor: theme.border.subtle,
        }}
      >
        <Pressable
          onPress={handleBack}
          accessibilityLabel="Back"
          style={{ width: touch.min, height: touch.min, borderWidth: theme.borderWidth.default, borderColor: theme.border.subtle, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={icon.sm} color={theme.text.secondary} />
        </Pressable>
        <Heading level={1} visual="body" font="body">{TITLES[view] || ''}</Heading>
        <View style={{ width: touch.min }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.lg, paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
        {view === 'main' ? (
          <>
            <Heading level={2} visual="label" style={{ marginBottom: spacing.xs }}>Schedule</Heading>
            <Row onPress={() => setView('schedule')} leftContent={<Text tone="secondary">Edit schedule</Text>} />
            <Divider />
            <Heading level={2} visual="label" style={{ marginBottom: spacing.xs }}>Account</Heading>
            <Row onPress={() => setView('account')} leftContent={<Text tone="secondary">Edit account</Text>} />
            <Divider />
            <Heading level={2} visual="label" style={{ marginBottom: spacing.xs }}>Notifications</Heading>
            <Row
              onPress={() => onToggleReminders?.(!remindersEnabled)}
              leftContent={<Text tone="secondary">Daily reminders</Text>}
              rightContent={<Text weight="semibold" style={{ color: remindersEnabled ? theme.accent.default : theme.text.tertiary }}>{remindersEnabled ? 'On' : 'Off'}</Text>}
            />
            <Divider />
            <Button variant="secondary" fullWidth onPress={() => setShowSignOutConfirm(true)}>Sign out</Button>
          </>
        ) : view === 'account' ? (
          <>
            <View style={{ marginBottom: spacing.xl }}>
              <Label>Full name</Label>
              <View>
                <Input value={displayName} onChangeText={handleDisplayNameChange} placeholder="e.g. Sofia von Hauske" autoComplete="name" autoCapitalize="words" />
                {nameSaving ? (
                  <View style={{ position: 'absolute', right: spacing.sm, top: 0, bottom: 0, justifyContent: 'center' }}>
                    <InlineLoader size="sm" />
                  </View>
                ) : null}
              </View>
            </View>

            <View style={{ marginBottom: spacing.xl }}>
              <Label>Email</Label>
              <Text tone="secondary" size="caption" style={{ marginBottom: spacing.xs }}>{user.email}</Text>
              <Input
                value={newEmail}
                onChangeText={(v) => { setNewEmail(v); setEmailMsg(''); }}
                placeholder="New email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ marginBottom: spacing.xs }}
              />
              {emailMsg ? <Text size="label" tone="danger" style={{ marginBottom: spacing.xs }}>{emailMsg}</Text> : null}
              <Button variant="secondary" fullWidth disabled={emailSaving || !newEmail.trim()} onPress={handleSaveEmail}>
                {emailSaving ? <InlineLoader size="sm" /> : 'Update email'}
              </Button>
            </View>

            <View>
              <Label>Password</Label>
              <Input value={newPassword} onChangeText={setNewPassword} placeholder="New password" secureTextEntry autoCapitalize="none" style={{ marginBottom: spacing.xs }} />
              <Input value={confirmPw} onChangeText={setConfirmPw} placeholder="Confirm new password" secureTextEntry autoCapitalize="none" style={{ marginBottom: spacing.xs }} />
              {confirmPw && !pwMatch ? <Text size="label" tone="danger" style={{ marginBottom: spacing.xs }}>Passwords don't match</Text> : null}
              <View style={{ marginBottom: spacing.xs }}>
                {PASSWORD_RULES.map((r) => <PasswordRule key={r.label} label={r.label} met={r.test(newPassword)} />)}
              </View>
              <Button variant="secondary" fullWidth disabled={pwSaving || !pwRulesOk || !pwMatch} onPress={handleSavePassword}>
                {pwSaving ? <InlineLoader size="sm" /> : 'Update password'}
              </Button>
            </View>
          </>
        ) : view === 'schedule' ? (
          <ScheduleTab
            scheduleMode={scheduleMode}
            scheduleConfig={scheduleConfig}
            anchorBehavior={anchorBehavior}
            consistentTime={consistentTime}
            adaptive={adaptiveEnabled}
            onSave={onSaveSchedule}
            supplements={supplements}
          />
        ) : null}
      </ScrollView>

      <Modal
        open={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Sign out of Origin?"
        footer={
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <Button variant="secondary" fullWidth onPress={() => setShowSignOutConfirm(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onPress={() => { setShowSignOutConfirm(false); onSignOut?.(); }}>Sign out</Button>
          </View>
        }
      >
        <Text tone="secondary">You'll need to sign in again to access your protocol. Your data stays safe.</Text>
      </Modal>
    </View>
  );
}
