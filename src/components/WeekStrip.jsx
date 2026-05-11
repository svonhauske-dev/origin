import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { spacing, typography } from '../design-system';
import { useTheme } from '../lib/theme';
import { dateKey } from '../lib/time';
import { calculateAdherenceForDate } from '../lib/adherence';
import AdherenceRing from './AdherenceRing';

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatWeekRange(start, end) {
  const sm = start.toLocaleDateString("en-US", { month: "short" });
  const em = end.toLocaleDateString("en-US", { month: "short" });
  return sm === em
    ? `${sm} ${start.getDate()} – ${end.getDate()}`
    : `${sm} ${start.getDate()} – ${em} ${end.getDate()}`;
}

function DayCell({ date, log, supplements, isSelected, isFuture, isToday, onClick }) {
  const { theme } = useTheme();
  const pct = isFuture ? null : calculateAdherenceForDate(date, supplements, log);

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.sm}px ${spacing.xxs}px`,
        background: isSelected ? theme.surface.cardSubtle : 'transparent',
        border: `${theme.borderWidth.default}px solid ${isSelected ? theme.border.subtle : 'transparent'}`,
        borderRadius: theme.radius.surface,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <span style={{
        fontSize: typography.caption,
        color: isToday ? theme.accent.default : theme.text.secondary,
        fontWeight: isToday ? typography.semibold : typography.regular,
        fontFamily: typography.fontBody,
      }}>
        {DAYS_SHORT[date.getDay()]}
      </span>
      <span style={{
        fontSize: typography.body,
        color: theme.text.primary,
        fontWeight: isSelected ? typography.semibold : typography.regular,
        fontFamily: typography.fontBody,
      }}>
        {date.getDate()}
      </span>
      {pct !== null ? (
        <AdherenceRing percentage={pct} size={40} />
      ) : (
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `2px solid ${theme.border.subtle}`,
          flexShrink: 0,
        }} />
      )}
    </button>
  );
}

export default function WeekStrip({
  weekDates, weekLogs, supplements,
  selectedDate, onSelectDate,
  onPrev, onNext, canNavigateNext,
}) {
  const { theme } = useTheme();

  const logMap = useMemo(() => {
    const m = {};
    for (const log of (weekLogs || [])) m[log.log_date] = log;
    return m;
  }, [weekLogs]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekStart = weekDates[0];
  const weekEnd = weekDates[weekDates.length - 1];

  const navBtnStyle = (enabled) => ({
    background: 'none',
    border: 'none',
    cursor: enabled ? 'pointer' : 'default',
    color: enabled ? theme.text.secondary : theme.text.muted,
    padding: `${spacing.xxs}px`,
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.radius.surface,
    WebkitTapHighlightColor: 'transparent',
    opacity: enabled ? 1 : 0.3,
  });

  return (
    <div style={{
      background: theme.surface.card,
      border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
      borderRadius: theme.radius.surface,
      padding: spacing.md,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
      }}>
        <button onClick={onPrev} style={navBtnStyle(true)}>
          <ChevronLeft size={18} />
        </button>
        <span style={{
          fontSize: typography.label,
          color: theme.text.secondary,
          letterSpacing: typography.labelSpacingWide,
          textTransform: 'uppercase',
          fontFamily: typography.fontBody,
          fontWeight: typography.semibold,
        }}>
          {formatWeekRange(weekStart, weekEnd)}
        </span>
        <button onClick={onNext} disabled={!canNavigateNext} style={navBtnStyle(canNavigateNext)}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: spacing.xs,
      }}>
        {weekDates.map(date => {
          const dk = dateKey(date);
          const log = logMap[dk] || null;
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          const isFuture = d > today;
          const isToday = d.getTime() === today.getTime();
          const isSelected = selectedDate && dateKey(selectedDate) === dk;
          return (
            <DayCell
              key={dk}
              date={date}
              log={log}
              supplements={supplements}
              isSelected={isSelected}
              isFuture={isFuture}
              isToday={isToday}
              onClick={() => onSelectDate(date)}
            />
          );
        })}
      </div>
    </div>
  );
}
