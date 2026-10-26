import type { Counts } from '../core/stats';

interface Props {
  counts: Counts;
}

const fmt = (n: number) => n.toLocaleString('he-IL');

// No finish date or pace estimate on purpose: against her real timeline it discourages more
// than it helps (constitution XII, spec FR-019).
export default function Progress({ counts: c }: Props) {
  const pct = (n: number) => `${(n / c.goal) * 100}%`;
  return (
    <section className="progress">
      <h1>התקדמות</h1>

      <div className="tiles">
        <div className="tile">
          <span className="tile-value">{fmt(c.new)}</span>
          <span className="tile-label">חדשות</span>
        </div>
        <div className="tile">
          <span className="tile-value">{fmt(c.learning)}</span>
          <span className="tile-label">בלמידה</span>
        </div>
        <div className="tile">
          <span className="tile-value">{fmt(c.learned)}</span>
          <span className="tile-label">נלמדו</span>
        </div>
      </div>

      <div className="bar" role="img" aria-label={`נלמדו ${c.learned} מתוך ${c.goal}`}>
        <span className="bar-learned" style={{ inlineSize: pct(c.learned) }} />
        <span className="bar-learning" style={{ inlineSize: pct(c.learning) }} />
      </div>
      <p className="muted">
        מטרה: {fmt(c.goal)} מילים · נטענו {fmt(c.loaded)} מילים מתוך {fmt(c.goal)}
      </p>

      <h2>כמה נשאר</h2>
      <div className="setting">
        <span className="setting-label">{fmt(c.notLearned)} מילים עוד לא נלמדו</span>
      </div>
    </section>
  );
}
