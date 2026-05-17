import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Plus, Pause, Play, Trash2, MoreHorizontal } from "lucide-react";
import { Pill, Syringe, Droplet } from "lucide-react";
import { spacing, typography, touch, layout } from "../design-system";
import { useTheme } from "../lib/theme";
import Badge from "./Badge";
import Button from "./Button";
import Modal from "./Modal";
import TabBar from "./TabBar";
import { isPausedSupp, isStoppedSupp } from "../lib/time";

function CategoryIcon({ category, color }) {
  if (category === "Rx")         return <Pill    size={14} color={color} style={{ flexShrink: 0 }} />;
  if (category === "Injectable") return <Syringe size={14} color={color} style={{ flexShrink: 0 }} />;
  if (category === "Topical")    return <Droplet size={14} color={color} style={{ flexShrink: 0 }} />;
  return null;
}

// Confirm copy templates. `body` is a function so we can inject the protocol name.
const CONFIRM_COPY = {
  archive: {
    title: (name) => `Archive ${name}?`,
    body:  () => "You can restore it from Archived anytime.",
    cta:   "Archive",
    variant: "destructive",
  },
  delete: {
    title: () => "Delete protocol?",
    body:  () => "This permanently deletes the protocol and all its supplements. This cannot be undone.",
    cta:   "Delete",
    variant: "destructive",
  },
};

export default function ProtocolDetailScreen({
  isOpen, onBack, protocol, supplements,
  onUpdateProtocol, onPauseProtocol, onArchiveProtocol, onActivateProtocol, onDeleteProtocol,
  onAddSupp, onEditSupp, onTogglePauseSupp, onResumeSupp, onDeleteSupp,
  isClinician, patients = [], onSendToPatient,
}) {
  const { theme } = useTheme();
  const [tab, setTab]                       = useState('active');
  const [editingName, setEditingName]       = useState(false);
  const [nameVal, setNameVal]               = useState('');
  const [confirmAction, setConfirmAction]   = useState(null);
  const [sendModalOpen, setSendModalOpen]   = useState(false);
  const [sending, setSending]               = useState(false);
  const [deletingSupp, setDeletingSupp]     = useState(null); // supp pending delete confirm
  const [menuOpen, setMenuOpen]             = useState(false); // overflow menu
  const nameInputRef = useRef(null);
  const scrollRef    = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setNameVal(protocol?.name || '');
      setEditingName(false);
      setConfirmAction(null);
      setDeletingSupp(null);
      setMenuOpen(false);
      setTab('active');
      if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
    }
  }, [isOpen, protocol?.id]);

  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  const isActive   = protocol?.status === 'active';
  const isPaused   = protocol?.status === 'paused';
  const isArchived = protocol?.status === 'archived';

  const protocolSupps = (protocol && supplements)
    ? supplements.filter(s => s.protocol_id === protocol.id)
    : [];
  const activeSupps  = protocolSupps.filter(s => !isStoppedSupp(s)).sort((a, b) => {
    if (isPausedSupp(a) !== isPausedSupp(b)) return isPausedSupp(a) ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
  const stoppedSupps = protocolSupps.filter(s => isStoppedSupp(s)).sort((a, b) => a.name.localeCompare(b.name));

  const saveName = async () => {
    if (!protocol) return;
    const trimmed = nameVal.trim();
    if (!trimmed || trimmed === protocol.name) { setEditingName(false); setNameVal(protocol.name); return; }
    await onUpdateProtocol({ ...protocol, name: trimmed });
    setEditingName(false);
  };

  const handleConfirm = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (action === 'archive') await onArchiveProtocol(protocol);
    if (action === 'delete')  { await onDeleteProtocol(protocol); onBack(); }
  };

  // Overflow menu items — order matches iOS action-sheet conventions
  // (lifecycle/state changes first, destructive last).
  const menuItems = (() => {
    if (!protocol) return [];
    const items = [];
    if (isActive) {
      items.push({ key: 'pause',    label: 'Pause protocol',    onSelect: () => { setMenuOpen(false); onPauseProtocol(protocol); } });
      items.push({ key: 'archive',  label: 'Archive protocol',  onSelect: () => { setMenuOpen(false); setConfirmAction('archive'); } });
    } else if (isPaused) {
      items.push({ key: 'activate', label: 'Activate protocol', onSelect: () => { setMenuOpen(false); onActivateProtocol(protocol); } });
      items.push({ key: 'archive',  label: 'Archive protocol',  onSelect: () => { setMenuOpen(false); setConfirmAction('archive'); } });
    } else if (isArchived) {
      items.push({ key: 'activate', label: 'Activate protocol', onSelect: () => { setMenuOpen(false); onActivateProtocol(protocol); } });
      items.push({ key: 'delete',   label: 'Delete protocol',   onSelect: () => { setMenuOpen(false); setConfirmAction('delete'); }, destructive: true });
    }
    if (isClinician && (isActive || isPaused)) {
      items.push({ key: 'send', label: 'Send to patient', onSelect: () => { setMenuOpen(false); setSendModalOpen(true); } });
    }
    return items;
  })();

  return (
    <div
      ref={scrollRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-out',
        zIndex: 102,
        background: theme.surface.canvas,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `max(20px, env(safe-area-inset-top)) ${spacing.md}px ${spacing.sm}px`,
        background: theme.surface.canvas,
        borderBottom: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
        position: 'sticky', top: 0, zIndex: 1,
      }}>
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: `${spacing.xs}px`, marginLeft: -spacing.xs,
            color: theme.text.primary, display: 'flex', alignItems: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <ChevronLeft size={24} />
        </button>

        {editingName ? (
          <form
            onSubmit={e => { e.preventDefault(); saveName(); }}
            style={{ flex: 1, margin: `0 ${spacing.sm}px` }}
          >
            <input
              ref={nameInputRef}
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={saveName}
              style={{
                width: '100%', background: 'none', border: 'none',
                borderBottom: `${theme.borderWidth.default}px solid ${theme.accent.default}`,
                fontSize: typography.body, fontWeight: typography.semibold,
                color: theme.text.primary, padding: `${spacing.xxs}px 0`, outline: 'none',
                textAlign: 'center', fontFamily: 'inherit',
              }}
            />
          </form>
        ) : (
          <button
            onClick={() => { setEditingName(true); setNameVal(protocol?.name || ''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: typography.body, fontWeight: typography.semibold,
              color: theme.text.primary, flex: 1, textAlign: 'center',
              padding: `${spacing.xs}px ${spacing.sm}px`,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {protocol?.name || ''}
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxs }}>
          {menuItems.length > 0 && (
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Protocol actions"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: `${spacing.xs}px`,
                color: theme.text.primary, display: 'flex', alignItems: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <MoreHorizontal size={22} />
            </button>
          )}
          {(isActive || isArchived) ? (
            <button
              onClick={onAddSupp}
              aria-label="Add supplement"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: `${spacing.xs}px`, marginRight: -spacing.xs,
                color: theme.accent.default, display: 'flex', alignItems: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Plus size={22} />
            </button>
          ) : (
            <div style={{ width: 40 }} />
          )}
        </div>
      </div>

      {protocol && (
        <div style={{
          maxWidth: layout.maxContentWidth, margin: '0 auto',
          padding: `${spacing.md}px ${spacing.md}px max(80px, env(safe-area-inset-bottom))`,
        }}>

          {/* Body CTAs (Send to patient + Pause/Archive/Activate/Delete row) moved
              to the overflow ⋯ menu in the header (May 17). Body now starts with
              the tab strip / list, flush under the sticky header. */}

          {/* Archived: flat list (no pause/resume, since archive resets all supps to active state).
              Active / Paused: Active / Stopped tabs. */}
          {isArchived ? (
            protocolSupps.length === 0 ? (
              <div style={{ fontSize: typography.body, color: theme.text.secondary, paddingBottom: spacing.xl }}>
                No supplements yet. Tap + to add one.
              </div>
            ) : (
              <div style={{ borderTop: `${theme.borderWidth.default}px solid ${theme.border.subtle}`, marginBottom: spacing.xl }}>
                {protocolSupps.map((supp, i) => {
                  const isLast = i === protocolSupps.length - 1;
                  return (
                    <div
                      key={supp.id}
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: `${spacing.sm}px 0`,
                        borderBottom: isLast ? 'none' : `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
                        minHeight: touch.min,
                      }}
                    >
                      <div
                        onClick={() => onEditSupp(supp)}
                        style={{
                          flex: 1, cursor: 'pointer', userSelect: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          paddingRight: spacing.sm, display: 'flex', alignItems: 'center',
                          gap: spacing.xs2, minWidth: 0,
                        }}
                      >
                        <span style={{ fontSize: typography.body, color: theme.text.primary, fontWeight: typography.medium }}>
                          {supp.name}
                        </span>
                        <CategoryIcon category={supp.category} color={theme.text.secondary} />
                      </div>
                      <Button
                        variant="icon"
                        aria-label={`Delete ${supp.name}`}
                        onClick={() => setDeletingSupp(supp)}
                        style={{ border: 'none' }}
                      >
                        <Trash2 size={18} color={theme.status.danger} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <>
              {/* Tab bar */}
              <TabBar
                tabs={[{ value: 'active', label: 'Active' }, { value: 'stopped', label: 'Stopped' }]}
                active={tab}
                onChange={setTab}
                style={{ marginBottom: spacing.lg }}
              />

              {/* ── Active tab ── */}
              {tab === 'active' && (
                activeSupps.length === 0 ? (
                  <div style={{ fontSize: typography.body, color: theme.text.secondary, paddingBottom: spacing.xl }}>
                    {isActive ? 'No supplements yet. Tap + to add one.' : 'No supplements.'}
                  </div>
                ) : (
                  <div style={{ borderTop: `${theme.borderWidth.default}px solid ${theme.border.subtle}`, marginBottom: spacing.xl }}>
                    {activeSupps.map((supp, i) => {
                      const isLast = i === activeSupps.length - 1;
                      return (
                        <div
                          key={supp.id}
                          style={{
                            display: 'flex', alignItems: 'center',
                            padding: `${spacing.sm}px 0`,
                            borderBottom: isLast ? 'none' : `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
                            minHeight: touch.min,
                            opacity: isPausedSupp(supp) ? 0.5 : 1,
                          }}
                        >
                          <div
                            onClick={() => onEditSupp(supp)}
                            style={{
                              flex: 1, cursor: 'pointer', userSelect: 'none',
                              WebkitTapHighlightColor: 'transparent',
                              paddingRight: spacing.sm, display: 'flex', alignItems: 'center',
                              gap: spacing.xs2, minWidth: 0,
                            }}
                          >
                            <span style={{ fontSize: typography.body, color: theme.text.primary, fontWeight: typography.medium }}>
                              {supp.name}
                            </span>
                            <CategoryIcon category={supp.category} color={theme.text.secondary} />
                            {isPausedSupp(supp) && <Badge variant="neutral">Paused</Badge>}
                          </div>
                          {isActive && (
                            <Button
                              variant="icon"
                              aria-label={isPausedSupp(supp) ? `Resume ${supp.name}` : `Pause ${supp.name}`}
                              onClick={() => onTogglePauseSupp(supp)}
                              style={{ border: 'none' }}
                            >
                              {isPausedSupp(supp)
                                ? <Play  size={18} color={theme.text.secondary} />
                                : <Pause size={18} color={theme.text.secondary} />
                              }
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* ── Stopped tab ── */}
              {tab === 'stopped' && (
                stoppedSupps.length === 0 ? (
                  <div style={{ fontSize: typography.body, color: theme.text.secondary, paddingBottom: spacing.xl }}>
                    Nothing stopped yet.
                  </div>
                ) : (
                  <div style={{ borderTop: `${theme.borderWidth.default}px solid ${theme.border.subtle}`, marginBottom: spacing.xl }}>
                    {stoppedSupps.map((supp, i) => {
                      const isLast = i === stoppedSupps.length - 1;
                      return (
                        <div
                          key={supp.id}
                          style={{
                            display: 'flex', alignItems: 'center',
                            padding: `${spacing.sm}px 0`,
                            borderBottom: isLast ? 'none' : `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
                            // Multi-line row (name + optional dose) — use touch.row (52pt)
                            // rather than touch.min (44pt) per design rules Cat 13.
                            minHeight: touch.row,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: typography.body, color: theme.text.secondary, fontWeight: typography.medium, display: 'flex', alignItems: 'center', gap: spacing.xs2 }}>
                              {supp.name}
                              <CategoryIcon category={supp.category} color={theme.text.secondary} />
                            </div>
                            {supp.dose && <div style={{ fontSize: typography.caption, color: theme.text.faint }}>{supp.dose}</div>}
                          </div>
                          <Button
                            variant="icon"
                            aria-label={`Delete ${supp.name}`}
                            onClick={() => setDeletingSupp(supp)}
                            style={{ border: 'none', marginRight: spacing.xs }}
                          >
                            <Trash2 size={18} color={theme.status.danger} />
                          </Button>
                          <Button variant="secondary" size="compact" onClick={() => onResumeSupp(supp)}>
                            Resume
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </>
          )}

        </div>
      )}

      {/* Overflow menu — bottom sheet with status-aware lifecycle actions */}
      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={protocol?.name || ''}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item, i) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onSelect}
              style={{
                display: 'flex', alignItems: 'center',
                width: '100%',
                padding: `${spacing.md}px 0`,
                background: 'transparent',
                border: 'none',
                borderTop: i > 0 ? `${theme.borderWidth.default}px solid ${theme.border.subtle}` : 'none',
                color: item.destructive ? theme.status.danger : theme.text.primary,
                fontFamily: 'inherit',
                fontSize: typography.body,
                fontWeight: typography.medium,
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: touch.min,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Modal>

      {/* Send to patient modal */}
      <Modal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        title="Send to patient"
      >
        {patients.length === 0 ? (
          <p style={{ fontSize: typography.body, color: theme.text.secondary, margin: 0 }}>
            No patients yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {patients.map((p, i) => (
              <button
                key={p.id}
                disabled={sending}
                onClick={async () => {
                  setSending(true);
                  await onSendToPatient(protocol, p.id);
                  setSending(false);
                  setSendModalOpen(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing.sm,
                  padding: `${spacing.sm}px 0`,
                  borderTop: i > 0 ? `${theme.borderWidth.default}px solid ${theme.border.subtle}` : 'none',
                  background: 'none', border: 'none', borderRadius: 0,
                  cursor: sending ? 'default' : 'pointer',
                  textAlign: 'left', width: '100%',
                  opacity: sending ? 0.5 : 1,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: theme.surface.cardSubtle,
                  border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: typography.caption, fontWeight: typography.semibold,
                  color: theme.text.primary,
                }}>
                  {(p.display_name || '?').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: typography.body, color: theme.text.primary }}>
                  {p.display_name || 'Unnamed patient'}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Confirmation modal (Archive / Delete) */}
      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction ? CONFIRM_COPY[confirmAction].title(protocol?.name) : ''}
        footer={
          <div style={{ display: 'flex', gap: spacing.xs }}>
            <Button variant="tertiary" fullWidth onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction ? CONFIRM_COPY[confirmAction].variant : 'primary'}
              fullWidth
              onClick={handleConfirm}
            >
              {confirmAction ? CONFIRM_COPY[confirmAction].cta : ''}
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: typography.body, color: theme.text.secondary, lineHeight: 1.6, margin: 0 }}>
          {confirmAction ? CONFIRM_COPY[confirmAction].body() : ''}
        </p>
      </Modal>

      {/* Delete supplement confirmation */}
      <Modal
        open={!!deletingSupp}
        onClose={() => setDeletingSupp(null)}
        title="Delete supplement?"
        footer={
          <div style={{ display: 'flex', gap: spacing.xs }}>
            <Button variant="tertiary" fullWidth onClick={() => setDeletingSupp(null)}>Cancel</Button>
            <Button
              variant="destructive"
              fullWidth
              onClick={async () => {
                const supp = deletingSupp;
                setDeletingSupp(null);
                if (supp && onDeleteSupp) await onDeleteSupp(supp.id);
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: typography.body, color: theme.text.secondary, lineHeight: 1.6, margin: 0 }}>
          This permanently deletes <strong style={{ color: theme.text.primary }}>{deletingSupp?.name}</strong>. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
