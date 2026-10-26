import type { Counts } from '../core/stats';
import type { LocalDate } from '../types';

interface Props {
  counts: Counts;
  finishDate: LocalDate | null;
  usesTargetPace: boolean;
  pace: number;
}

const fmt = (n: number) => n.toLocaleString('he-IL');

const formatDate = (day: LocalDate) =>
  new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date(`${day}T12:00:00`));

export default function Progress({ counts: c, finishDate, usesTargetPace, pace }: Props) {
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
        <span>
          כל המילים יילמדו בערך עד: <strong>{finishDate ? formatDate(finishDate) : '—'}</strong>
        </span>
        <span className="muted">
          {usesTargetPace
            ? `לפי היעד של ${fmt(pace)} מילים חדשות ביום. אחרי שבוע של לימוד ההערכה תתבסס על הקצב שלך.`
            : `לפי הקצב שלך בשבועיים האחרונים: כ-${fmt(Math.round(pace * 10) / 10)} מילים חדשות ביום.`}
        </span>
      </div>
    </section>
  );
}
