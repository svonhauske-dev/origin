import { useState, useEffect } from 'react';
import { spacing, typography } from '../design-system';
import { useTheme } from '../lib/theme';
import { SLOTS } from '../lib/notifications';
import { getSlotLabelForMode } from '../config';
import SlotRow from './SlotRow';
import SupplementRow from './SupplementRow';
import TodayPanelHeader from './TodayPanelHeader';

export default function TodayPanel({
  viewDate,
  isToday, isPast, isFuture,
  homeSupps,
  anytimeSupps,
  getSuppsForSlot,
  isChecked,
  toggleCheck,
  slotTimeStr,
  slotStatus,
  scheduleMode,
  pillTime,
  anchorBehavior,
  consistentTime,
  isReadOnly,
  pastDayEditing,
  setPastDayEditing,
  startDay,
  editPillTime,
  setEditPillTime,
  tmpTime,
  setTmpTime,
  setPillForDay,
  openEdit,
}) {
  const { theme } = useTheme();

  const activeSlots = SLOTS
    .filter(slot => getSuppsForSlot(slot.id).length > 0)
    .map(slot => {
      const override = getSlotLabelForMode(slot.id, scheduleMode);
      return override ? { ...slot, label: override } : slot;
    });

  const getDefaultExpanded = () => {
    if (activeSlots.length === 0) return null;
    if (isToday) {
      for (const slot of activeSlots) {
        if (slotStatus(slot.id) === 'now') return slot.id;
      }
      for (const slot of activeSlots) {
        if (slotStatus(slot.id) === 'missed') return slot.id;
      }
    }
    return activeSlots[0]?.id ?? null;
  };

  const [expandedSlotId, setExpandedSlotId] = useState(() => getDefaultExpanded());

  useEffect(() => {
    setExpandedSlotId(getDefaultExpanded());
  }, [viewDate]);

  return (
    <div style={{
      background: theme.surface.card,
      border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
      borderRadius: theme.radius.surface,
      overflow: 'hidden',
    }}>
      <TodayPanelHeader
        viewDate={viewDate}
        isToday={isToday}
        isPast={isPast}
        scheduleMode={scheduleMode}
        pillTime={pillTime}
        anchorBehavior={anchorBehavior}
        consistentTime={consistentTime}
        isReadOnly={isReadOnly}
        pastDayEditing={pastDayEditing}
        setPastDayEditing={setPastDayEditing}
        startDay={startDay}
        editPillTime={editPillTime}
        setEditPillTime={setEditPillTime}
        tmpTime={tmpTime}
        setTmpTime={setTmpTime}
        setPillForDay={setPillForDay}
      />

      {homeSupps.length === 0 ? (
        <div style={{
          padding: `${spacing.xl}px ${spacing.lg}px`,
          textAlign: 'center',
          color: theme.text.muted,
          fontSize: typography.body,
          fontFamily: typography.fontBody,
        }}>
          No supplements scheduled
        </div>
      ) : (
        <div style={{
          padding: spacing.md,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
          opacity: isReadOnly ? 0.6 : 1,
          pointerEvents: isReadOnly ? 'none' : 'auto',
          transition: 'opacity 200ms ease',
        }}>
          {activeSlots.map(slot => {
            const slotSupps = getSuppsForSlot(slot.id);
            const loggedSupps = {};
            for (const s of slotSupps) loggedSupps[s.id] = isChecked(slot.id, s.id);
            return (
              <SlotRow
                key={slot.id}
                slotName={slot.label}
                slotTime={slotTimeStr(slot.id)}
                supplements={slotSupps}
                loggedSupps={loggedSupps}
                isExpanded={expandedSlotId === slot.id}
                onToggleExpand={() => setExpandedSlotId(prev => prev === slot.id ? null : slot.id)}
                isReadOnly={isReadOnly}
                onToggleSupplement={(suppId) => toggleCheck(slot.id, suppId)}
                onEditSupplement={(suppId) => {
                  const s = slotSupps.find(x => x.id === suppId);
                  if (s) openEdit(s);
                }}
              />
            );
          })}

          {anytimeSupps.length > 0 && (
            <div style={{
              border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
              borderRadius: theme.radius.surface,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: `${spacing.md}px ${spacing.lg}px`,
                fontSize: typography.body,
                fontWeight: typography.medium,
                color: theme.text.primary,
                fontFamily: typography.fontBody,
                borderBottom: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
                background: theme.surface.card,
              }}>
                Anytime
              </div>
              <div style={{ padding: `${spacing.xs}px ${spacing.sm}px`, background: theme.surface.card }}>
                {anytimeSupps.map(s => (
                  <SupplementRow
                    key={s.id}
                    supplement={s}
                    checked={isChecked('anytime', s.id)}
                    isReadOnly={isReadOnly}
                    onToggle={() => toggleCheck('anytime', s.id)}
                    onEdit={() => openEdit(s)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
