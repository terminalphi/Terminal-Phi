import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import './DashboardSection.css';

/* ── Helpers ──────────────────────────────────────────────── */

/** Build a 52-week heatmap grid from the raw jsonb array */
function buildHeatmap(raw = []) {
  // raw: [{date:"2026-01-01", count:3}, ...]
  const map = {};
  raw.forEach(({ date, count }) => { map[date] = count; });

  const today = new Date();
  // Start from 52 weeks ago, aligned to Sunday
  const start = new Date(today);
  start.setDate(today.getDate() - 364);
  // Rewind to previous Sunday
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  const cur = new Date(start);

  while (cur <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const iso = cur.toISOString().split('T')[0];
      const count = map[iso] || 0;
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 7 ? 3 : 4;
      week.push({ date: iso, count, level });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** Compute max streak from sorted heatmap data */
function computeStreaks(raw = []) {
  const dates = raw
    .filter(r => r.count > 0)
    .map(r => r.date)
    .sort();

  let maxStreak = 0, cur = 0, prev = null;
  let currentStreak = 0;

  const todayStr = new Date().toISOString().split('T')[0];

  dates.forEach(d => {
    if (!prev) { cur = 1; }
    else {
      const diff = (new Date(d) - new Date(prev)) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
    }
    maxStreak = Math.max(maxStreak, cur);
    prev = d;
  });

  // currentStreak: days going back from today consecutively
  if (dates.length > 0) {
    const rev = [...dates].reverse();
    let check = new Date(todayStr);
    for (const d of rev) {
      if (d === check.toISOString().split('T')[0]) {
        currentStreak++;
        check.setDate(check.getDate() - 1);
      } else break;
    }
  }

  return { maxStreak, currentStreak };
}

/** Extract month labels for the heatmap */
function getMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const month = new Date(week[0].date).getMonth();
    if (month !== lastMonth) {
      labels.push({ index: i, label: new Date(week[0].date).toLocaleString('default', { month: 'short' }) });
      lastMonth = month;
    }
  });
  return labels;
}

/* ── Sub-components ───────────────────────────────────────── */

function DonutRing({ total, easy, medium, hard, label, colors }) {
  const radius = 34;
  const circ = 2 * Math.PI * radius;
  const segs = [
    { val: easy,   color: colors[0] },
    { val: medium, color: colors[1] },
    { val: hard,   color: colors[2] },
  ].filter(s => s.val > 0);

  let offset = 0;
  const totalVal = segs.reduce((s, x) => s + x.val, 0) || 1;

  return (
    <div className="db-ring-wrap">
      <div>
        <div className="db-ring-wrap__label">{label}</div>
        <div className="db-ring">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            {segs.map((seg, i) => {
              const len = (seg.val / totalVal) * circ;
              const el = (
                <circle
                  key={i}
                  cx="40" cy="40" r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="10"
                  strokeDasharray={`${len} ${circ - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="db-ring__center">{total}</div>
        </div>
      </div>
      <div className="db-ring__stats">
        {[
          { label: 'Easy',   val: easy,   color: colors[0] },
          { label: 'Medium', val: medium, color: colors[1] },
          { label: 'Hard',   val: hard,   color: colors[2] },
        ].map(row => (
          <div className="db-ring__row" key={row.label}>
            <span>
              <span className="db-ring__dot" style={{ background: row.color }} />
              {row.label}
            </span>
            <span className="db-ring__count">{row.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Heatmap({ data }) {
  const weeks = buildHeatmap(data);
  const totalSubmissions = data.reduce((s, d) => s + d.count, 0);
  const { maxStreak, currentStreak } = computeStreaks(data);
  const monthLabels = getMonthLabels(weeks);
  const [tooltip, setTooltip] = useState(null);

  const CELL_SIZE = 12;
  const GAP = 3;

  return (
    <div>
      <div className="db-heatmap__header">
        <span className="db-card__label">Submission Activity</span>
        <div className="db-heatmap__meta">
          <span>Submissions <strong>{totalSubmissions}</strong></span>
          <span>Max.Streak <strong>{maxStreak}</strong></span>
          <span>Current.Streak <strong>{currentStreak}</strong></span>
        </div>
      </div>

      {/* Month labels */}
      <div className="db-heatmap__months">
        {monthLabels.map(({ index, label }) => (
          <span
            key={label}
            className="db-heatmap__month-label"
            style={{ marginLeft: index === 0 ? 0 : `${(index - (monthLabels[monthLabels.indexOf({ index, label })] ?? {}).prevIndex || 0) * (CELL_SIZE + GAP)}px`, paddingLeft: index === 0 ? 0 : undefined }}
          >
            {label}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        ))}
      </div>

      {/* Cells */}
      <div className="db-heatmap__grid">
        {weeks.map((week, wi) => (
          <div className="db-heatmap__week" key={wi}>
            {week.map((cell, di) => (
              <div
                key={di}
                className="db-heatmap__cell"
                data-level={cell.level}
                onMouseEnter={() => setTooltip({ ...cell, x: wi, y: di })}
                onMouseLeave={() => setTooltip(null)}
              >
                {tooltip?.date === cell.date && (
                  <div className="db-tooltip">
                    {cell.count} submissions · {cell.date}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="db-heatmap__legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(l => (
          <div key={l} className="db-heatmap__legend-cell" data-level={l} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,10,10,0.9)',
      border: '1px solid rgba(212,175,55,0.3)',
      borderRadius: 8,
      padding: '8px 12px',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      color: 'var(--text-primary)',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
      <div><strong>{payload[0].value}</strong></div>
    </div>
  );
};

/* ── Platform icons (SVG inline) ──────────────────────────── */
const LCIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z"/>
  </svg>
);

const CCIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.257.004C5.023-.109-.104 5.17.004 11.51c.097 5.952 4.93 10.84 10.882 10.485 5.817-.346 10.499-5.296 10.11-11.212C20.618 4.877 16.228.1 11.257.004zm-.78 3.64c3.585-.283 6.63 2.537 6.87 6.138.234 3.496-2.396 6.564-5.891 6.792-3.57.23-6.64-2.534-6.874-6.106-.241-3.67 2.56-6.59 5.895-6.824z"/>
  </svg>
);

const CSIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm-1 4v2H9v2h2v6h2v-6h2v-2h-2V8z"/>
  </svg>
);

/* ── Main component ───────────────────────────────────────── */

/**
 * DashboardSection
 * @param {{ profile: Object, stats: Object }} props
 *   profile: row from Candidates_data_table { Full_Name, Roll_Number, Email, Portfolio }
 *   stats:   row from member_stats (all the coding data)
 */
function DashboardSection({ profile, stats }) {
  const name       = profile?.Full_Name  || 'Member';
  const rollNo     = profile?.Roll_Number || '—';
  const email      = profile?.Email       || '';
  const portfolio  = profile?.Portfolio   || '';

  const totalQ     = stats?.total_questions     ?? 0;
  const activeDays = stats?.total_active_days   ?? 0;
  const totalC     = stats?.total_contests      ?? 0;
  const lcC        = stats?.leetcode_contests   ?? 0;
  const ccC        = stats?.codechef_contests   ?? 0;
  const lcUser     = stats?.leetcode_username   || '';
  const csUser     = stats?.codestudio_username || '';
  const ccUser     = stats?.codechef_username   || '';
  const ratingHist = stats?.rating_history      || [];
  const heatmap    = stats?.activity_heatmap    || [];

  // Easy / Medium / Hard from DSA total (simple sum display)
  const dsaTotal   = stats?.dsa_easy ?? 0 + (stats?.dsa_medium ?? 0) + (stats?.dsa_hard ?? 0);
  const dsaEasy    = stats?.dsa_easy   ?? 0;
  const dsaMedium  = stats?.dsa_medium ?? 0;
  const dsaHard    = stats?.dsa_hard   ?? 0;

  const latestRating = ratingHist.length > 0 ? ratingHist[ratingHist.length - 1].rating : null;
  const peakRating   = ratingHist.length > 0 ? Math.max(...ratingHist.map(r => r.rating)) : null;

  const initials = name.trim().charAt(0).toUpperCase();

  const platforms = [
    lcUser  && { key: 'lc', label: 'LeetCode',    icon: <LCIcon />, cls: 'lc', url: `https://leetcode.com/${lcUser}` },
    ccUser  && { key: 'cc', label: 'CodeChef',    icon: <CCIcon />, cls: 'cc', url: `https://codechef.com/users/${ccUser}` },
    csUser  && { key: 'cs', label: 'CodeStudio',  icon: <CSIcon />, cls: 'cs', url: `https://codingninjas.com/codestudio/profile/${csUser}` },
    portfolio && { key: 'gh', label: 'Portfolio/GitHub', icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ), cls: 'cs', url: portfolio },
  ].filter(Boolean);

  return (
    <section className="dashboard">
      <div className="dashboard__grid">

        {/* ── Profile ──────────────────────────────────────── */}
        <div className="db-card db-profile">
          <div className="db-profile__avatar">{initials}</div>
          <h2 className="db-profile__name">{name}</h2>
          <p className="db-profile__roll">
            <span className="db-profile__roll-dot" />
            {rollNo}
          </p>

          <div className="db-profile__meta">
            {email && (
              <div className="db-profile__meta-row">
                <svg className="db-profile__meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 7L2 7" />
                </svg>
                <span>{email}</span>
              </div>
            )}
            <div className="db-profile__meta-row">
              <svg className="db-profile__meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>India</span>
            </div>
          </div>

          {/* Platform links */}
          {platforms.length > 0 && (
            <div className="db-profile__platforms">
              <div className="db-profile__platforms-title">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                Problem Solving Stats
              </div>
              {platforms.map(p => (
                <div className="db-platform-row" key={p.key}>
                  <div className="db-platform-row__left">
                    <div className={`db-platform-row__icon db-platform-row__icon--${p.cls}`}>{p.icon}</div>
                    {p.label}
                  </div>
                  <div className="db-platform-row__right">
                    <span className="db-platform-row__check">✓</span>
                    <a className="db-platform-row__link" href={p.url} target="_blank" rel="noopener noreferrer">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15,3 21,3 21,9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right column top: stats + contests ────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stats strip */}
          <div className="db-stats-strip">
            <div className="db-card db-stat">
              <div className="db-card__label">Total Questions</div>
              <div className="db-stat__value">{totalQ}</div>
              <div className="db-stat__label">problems solved across all platforms</div>
            </div>
            <div className="db-card db-stat">
              <div className="db-card__label">Total Active Days</div>
              <div className="db-stat__value">{activeDays}</div>
              <div className="db-stat__label">days with at least one submission</div>
            </div>
          </div>

          {/* Contests */}
          <div className="db-card">
            <div className="db-card__label">Total Contests</div>
            <div className="db-contests">
              <div className="db-contests__total">{totalC}</div>
              <div className="db-contests__breakdown">
                <div className="db-contests__row">
                  <div className="db-contests__platform">
                    <span style={{ color: '#f89f1b', fontWeight: 700, fontSize: '0.75rem' }}>LC</span>
                    LeetCode
                  </div>
                  <span className="db-contests__count">{lcC}</span>
                </div>
                <div className="db-contests__row">
                  <div className="db-contests__platform">
                    <span style={{ color: '#5b8af2', fontWeight: 700, fontSize: '0.75rem' }}>CC</span>
                    CodeChef
                  </div>
                  <span className="db-contests__count">{ccC}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Problems solved (DSA ring) ─────────────────────── */}
        <div className="db-card db-problems">
          <h3 className="db-problems__title">Problems Solved</h3>
          <DonutRing
            label="DSA"
            total={totalQ}
            easy={dsaEasy}
            medium={dsaMedium}
            hard={dsaHard}
            colors={['#22c55e', '#eab308', '#ef4444']}
          />
        </div>

        {/* ── Heatmap ───────────────────────────────────────── */}
        {heatmap.length > 0 && (
          <div className="db-card db-heatmap">
            <Heatmap data={heatmap} />
          </div>
        )}

        {/* ── Rating chart ──────────────────────────────────── */}
        {ratingHist.length > 0 && (
          <div className="db-card db-rating">
            <div className="db-rating__header">
              <div>
                <div className="db-card__label">Contest Rating</div>
                {latestRating && <div className="db-rating__value">{latestRating}</div>}
              </div>
              {peakRating && (
                <div className="db-rating__peak">Peak: {peakRating}</div>
              )}
            </div>
            <div className="db-rating__chart">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={ratingHist} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="url(#ratingGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default DashboardSection;
