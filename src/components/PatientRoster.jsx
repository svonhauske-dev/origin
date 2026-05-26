import { useMemo, useState } from "react";
import { spacing, typography, touch } from "../design-system";
import { useTheme } from "../lib/theme";
import Sparkline from "./Sparkline";
import StatusDot from "./StatusDot";

// Triage severity (matches Sidebar logic).
function severity(pct) {
  if (pct == null) return null;
  if (pct >= 80) return "success";
  if (pct >= 50) return "warning";
  return "danger";
}

function statusLabel(pct) {
  if (pct == null) return "No data";
  if (pct >= 80) return "On track";
  if (pct >= 50) return "At risk";
  return "Low";
}

function formatLastLog(logDate) {
  if (!logDate) return "—";
  const [y, m, d] = logDate.split("-").map(Number);
  const then = new Date(y, m - 1, d);
  then.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today - then) / 86400000);
  if (days <= 0)  return "today";
  if (days === 1) return "yesterday";
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Column definitions — header label + accessor + sort comparator + alignment.
const COLUMNS = [
  { key: "name",        label: "Patient",   width: "minmax(180px, 1.5fr)", align: "left" },
  { key: "adherence7",  label: "7d",        width: "70px",  align: "right" },
  { key: "adherence30", label: "30d",       width: "70px",  align: "right" },
  { key: "trend",       label: "Trend",     width: "140px", align: "left",  sortable: false },
  { key: "activeCount", label: "Protocols", width: "100px", align: "right" },
  { key: "lastLogDate", label: "Last log",  width: "110px", align: "right" },
  { key: "status",      label: "Status",    width: "120px", align: "right" },
];

// KPI card at the top of the roster. Big number + label + optional subtitle.
function KpiCard({ value, label, severity }) {
  const { theme } = useTheme();
  const valueColor =
    severity === "warning" ? theme.status.warning :
    severity === "danger"  ? theme.status.danger  :
                              theme.text.primary;
  return (
    <div style={{
      flex: 1,
      padding: `${spacing.md}px ${spacing.lg}px`,
      border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
      borderRadius: theme.radius.surface,
      background: theme.surface.card,
      display: "flex",
      flexDirection: "column",
      gap: spacing.xxs,
      minWidth: 0,
    }}>
      <span style={{
        fontSize: typography.label,
        color: theme.text.secondary,
        letterSpacing: typography.labelSpacingWide,
        textTransform: "uppercase",
        fontFamily: typography.fontBody,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: typography.heading,
        fontWeight: typography.bold,
        color: valueColor,
        fontFamily: typography.fontData,
        lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  );
}

// Segmented filter chip group above the table.
function FilterChips({ active, onChange, options }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: "flex", gap: spacing.xs }}>
      {options.map(opt => {
        const isOn = active === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            style={{
              padding: `${spacing.xs}px ${spacing.md}px`,
              fontFamily: typography.fontBody,
              fontSize: typography.caption,
              fontWeight: isOn ? typography.semibold : typography.regular,
              color: isOn ? theme.text.primary : theme.text.secondary,
              background: isOn ? theme.surface.cardSubtle : "transparent",
              border: `${theme.borderWidth.default}px solid ${isOn ? theme.border.strong : theme.border.subtle}`,
              borderRadius: theme.radius.surface,
              cursor: "pointer",
              transition: "background 120ms ease, color 120ms ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {opt.label}
            {opt.count != null && (
              <span style={{
                marginLeft: spacing.xs,
                color: isOn ? theme.text.secondary : theme.text.tertiary,
                fontFamily: typography.fontData,
              }}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Header cell. Click toggles sort direction; clicking a different column
// resets direction to "asc" (for text) or "desc" (for numeric).
function HeaderCell({ col, sort, setSort, theme }) {
  const isSortable = col.sortable !== false;
  const isActive = sort.key === col.key;
  const arrow = !isActive ? "" : sort.dir === "asc" ? " ↑" : " ↓";
  return (
    <button
      type="button"
      disabled={!isSortable}
      onClick={() => {
        if (!isSortable) return;
        if (isActive) {
          setSort({ key: col.key, dir: sort.dir === "asc" ? "desc" : "asc" });
        } else {
          // Numeric columns default to descending (worst-first triage),
          // text columns default to ascending (alphabetical).
          const defaultDir = col.key === "name" ? "asc" : "desc";
          setSort({ key: col.key, dir: defaultDir });
        }
      }}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        textAlign: col.align,
        fontFamily: typography.fontBody,
        fontSize: typography.label,
        color: isActive ? theme.text.primary : theme.text.secondary,
        letterSpacing: typography.labelSpacingWide,
        textTransform: "uppercase",
        fontWeight: typography.semibold,
        cursor: isSortable ? "pointer" : "default",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {col.label}{arrow}
    </button>
  );
}

// One patient row.
function PatientRow({ patient, stats, onClick, theme }) {
  const [hovered, setHovered] = useState(false);
  const initial = ((patient.display_name || "?").charAt(0)).toUpperCase();
  const pct7  = stats?.adherence7;
  const pct30 = stats?.adherence30;
  const sev   = severity(pct7);

  const cellStyle = (align) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: align === "right" ? "flex-end" : "flex-start",
    minWidth: 0,
    fontFamily: typography.fontBody,
    fontSize: typography.caption,
    color: theme.text.primary,
  });

  const num = {
    fontFamily: typography.fontData,
    fontSize: typography.caption,
    color: theme.text.primary,
  };
  const numMuted = { ...num, color: theme.text.secondary };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: COLUMNS.map(c => c.width).join(" "),
        columnGap: spacing.md,
        alignItems: "center",
        padding: `${spacing.sm}px ${spacing.md}px`,
        background: hovered ? theme.surface.hover : "transparent",
        borderBottom: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
        cursor: "pointer",
        transition: "background 120ms ease",
        WebkitTapHighlightColor: "transparent",
        minHeight: 52,
      }}
    >
      {/* Patient (avatar + name) */}
      <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, minWidth: 0 }}>
        <div aria-hidden style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: theme.surface.cardSubtle,
          border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: typography.fontData,
          fontSize: typography.caption,
          fontWeight: typography.medium,
          color: theme.text.primary,
        }}>
          {initial}
        </div>
        <span style={{
          fontFamily: typography.fontBody,
          fontSize: typography.body,
          fontWeight: typography.medium,
          color: theme.text.primary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {patient.display_name || "Unnamed"}
        </span>
      </div>

      {/* 7d */}
      <div style={cellStyle("right")}>
        <span style={pct7 == null ? numMuted : num}>{pct7 == null ? "—" : `${pct7}%`}</span>
      </div>

      {/* 30d */}
      <div style={cellStyle("right")}>
        <span style={pct30 == null ? numMuted : num}>{pct30 == null ? "—" : `${pct30}%`}</span>
      </div>

      {/* Trend */}
      <div style={cellStyle("left")}>
        {stats?.sparkline && <Sparkline values={stats.sparkline} width={120} height={14} />}
      </div>

      {/* Protocols */}
      <div style={cellStyle("right")}>
        <span style={stats?.activeCount == null ? numMuted : num}>
          {stats?.activeCount == null ? "—" : stats.activeCount}
        </span>
      </div>

      {/* Last log */}
      <div style={cellStyle("right")}>
        <span style={numMuted}>{formatLastLog(stats?.lastLogDate)}</span>
      </div>

      {/* Status */}
      <div style={{ ...cellStyle("right"), gap: spacing.xs }}>
        {sev && <StatusDot status={sev} />}
        <span style={{
          fontFamily: typography.fontBody,
          fontSize: typography.caption,
          color: theme.text.primary,
        }}>
          {statusLabel(pct7)}
        </span>
      </div>
    </div>
  );
}

// Full clinician roster surface. Default landing when a clinician has no
// patient selected. KPI cards on top → filter chips → sortable table.
// Alphabetical sort is the persistent default; the column headers are
// click-to-sort for triage views (worst-first on adherence columns).
export default function PatientRoster({ patients = [], patientStats = {}, onPatientSelect }) {
  const { theme } = useTheme();
  const [sort, setSort]     = useState({ key: "name", dir: "asc" });
  const [filter, setFilter] = useState("all");

  // KPI counts.
  const totalCount  = patients.length;
  const reviewCount = useMemo(() => {
    let n = 0;
    for (const p of patients) {
      const pct = patientStats[p.id]?.adherence7;
      if (pct != null && pct < 80) n++;
    }
    return n;
  }, [patients, patientStats]);
  const silentCount = useMemo(() => {
    // Patients with no log activity in the last 7 days.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let n = 0;
    for (const p of patients) {
      const last = patientStats[p.id]?.lastLogDate;
      if (!last) { n++; continue; }
      const [y, m, d] = last.split("-").map(Number);
      const then = new Date(y, m - 1, d);
      then.setHours(0, 0, 0, 0);
      const days = Math.round((today - then) / 86400000);
      if (days >= 7) n++;
    }
    return n;
  }, [patients, patientStats]);

  // Apply filter.
  const filtered = useMemo(() => {
    if (filter === "all") return patients;
    if (filter === "review") {
      return patients.filter(p => {
        const pct = patientStats[p.id]?.adherence7;
        return pct != null && pct < 80;
      });
    }
    if (filter === "silent") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return patients.filter(p => {
        const last = patientStats[p.id]?.lastLogDate;
        if (!last) return true;
        const [y, m, d] = last.split("-").map(Number);
        const then = new Date(y, m - 1, d);
        then.setHours(0, 0, 0, 0);
        return Math.round((today - then) / 86400000) >= 7;
      });
    }
    return patients;
  }, [patients, patientStats, filter]);

  // Apply sort.
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const sign = sort.dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const sa = patientStats[a.id] || {};
      const sb = patientStats[b.id] || {};
      let av, bv;
      switch (sort.key) {
        case "name":
          av = (a.display_name || "").toLowerCase();
          bv = (b.display_name || "").toLowerCase();
          return av < bv ? -1 * sign : av > bv ? 1 * sign : 0;
        case "adherence7":  av = sa.adherence7  ?? -1; bv = sb.adherence7  ?? -1; break;
        case "adherence30": av = sa.adherence30 ?? -1; bv = sb.adherence30 ?? -1; break;
        case "activeCount": av = sa.activeCount ?? -1; bv = sb.activeCount ?? -1; break;
        case "lastLogDate": av = sa.lastLogDate || ""; bv = sb.lastLogDate || ""; break;
        case "status":      av = sa.adherence7  ?? -1; bv = sb.adherence7  ?? -1; break;
        default: return 0;
      }
      return av < bv ? -1 * sign : av > bv ? 1 * sign : 0;
    });
    return arr;
  }, [filtered, patientStats, sort]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>

      {/* Page heading */}
      <h1 style={{
        margin: 0,
        fontFamily: typography.fontHeading,
        fontSize: typography.heading,
        fontWeight: typography.semibold,
        color: theme.text.primary,
        letterSpacing: typography.headingLetterSpacing,
      }}>
        Patients
      </h1>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: spacing.md }}>
        <KpiCard label="Total"        value={totalCount} />
        <KpiCard label="Need review"  value={reviewCount} severity={reviewCount > 0 ? "warning" : null} />
        <KpiCard label="Quiet 7d"     value={silentCount} severity={silentCount > 0 ? "danger"  : null} />
      </div>

      {/* Filter chips */}
      <FilterChips
        active={filter}
        onChange={setFilter}
        options={[
          { key: "all",    label: "All",          count: totalCount },
          { key: "review", label: "Needs review", count: reviewCount },
          { key: "silent", label: "Quiet 7d",     count: silentCount },
        ]}
      />

      {/* Table */}
      <div style={{
        border: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
        borderRadius: theme.radius.surface,
        background: theme.surface.card,
        overflow: "hidden",
      }}>
        {/* Header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: COLUMNS.map(c => c.width).join(" "),
          columnGap: spacing.md,
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderBottom: `${theme.borderWidth.default}px solid ${theme.border.subtle}`,
          background: theme.surface.cardSubtle,
        }}>
          {COLUMNS.map(col => (
            <div key={col.key} style={{
              display: "flex",
              justifyContent: col.align === "right" ? "flex-end" : "flex-start",
            }}>
              <HeaderCell col={col} sort={sort} setSort={setSort} theme={theme} />
            </div>
          ))}
        </div>

        {/* Body */}
        {sorted.length === 0 ? (
          <div style={{
            padding: `${spacing.xl}px ${spacing.lg}px`,
            textAlign: "center",
            fontSize: typography.caption,
            color: theme.text.secondary,
            fontFamily: typography.fontHeading,
          }}>
            {filter === "all" ? "No patients yet." : "No matches."}
          </div>
        ) : (
          sorted.map(p => (
            <PatientRow
              key={p.id}
              patient={p}
              stats={patientStats[p.id]}
              onClick={() => onPatientSelect?.(p)}
              theme={theme}
            />
          ))
        )}
      </div>
    </div>
  );
}
