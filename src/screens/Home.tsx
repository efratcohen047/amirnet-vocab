import type { LocalDate } from '../types';

export type HomeStatus = 'start' | 'resume' | 'done' | 'rest';

interface Props {
  status: HomeStatus;
  nextDue: LocalDate | null;
  /** Every loaded word has been introduced; new words arrive with the next batch. */
  noNewWords: boolean;
  onStart: () => void;
}

const formatDay = (day: LocalDate) =>
  new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(`${day}T12:00:00`),
  );

export default function Home({ status, nextDue, noNewWords, onStart }: Props) {
  return (
    <section className="home">
      <h1 className="home-title">אמירנט – אוצר מילים</h1>

      {(status === 'start' || status === 'resume') && (
        <button className="primary big" onClick={onStart}>
          {status === 'resume' ? 'המשך' : 'התחל'}
        </button>
      )}

      {status === 'done' && <p className="home-msg">סיימת להיום 🎉</p>}
      {status === 'rest' && <p className="home-msg">אין מה ללמוד היום</p>}
      {(status === 'done' || status === 'rest') && nextDue && (
        <p className="muted">הסשן הבא: {formatDay(nextDue)}</p>
      )}

      {noNewWords && <p className="muted">למדת את כל המילים שנטענו. מילים חדשות יגיעו בעדכון הבא.</p>}
    </section>
  );
}
