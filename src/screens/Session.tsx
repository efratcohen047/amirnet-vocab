import { useState } from 'react';
import { currentCard, isComplete, summarize } from '../core/session';
import { accuracy } from '../core/stats';
import type { Pos, Rating, Session as SessionT, Word } from '../types';

const POS_HE: Record<Pos, string> = {
  noun: 'שם עצם',
  verb: 'פועל',
  adj: 'שם תואר',
  adv: 'תואר הפועל',
  prep: 'מילת יחס',
  conj: 'מילת חיבור',
  pron: 'כינוי גוף',
  det: 'מילת יידוע',
  other: 'אחר',
};

interface Props {
  session: SessionT;
  wordById: Map<string, Word>;
  onAnswer: (rating: Rating) => void;
  /** Moves past a card whose word is no longer in the data file, without scheduling it. */
  onSkip: () => void;
  onDone: () => void;
  isFlagged: (id: string) => boolean;
  onFlag: (word: Word, note: string) => void;
  onUnflag: (id: string) => void;
}

export default function Session({ session, wordById, onAnswer, onSkip, onDone, isFlagged, onFlag, onUnflag }: Props) {
  // Reveal state belongs to one card; keyed by position so it resets on the next card.
  const [revealedAt, setRevealedAt] = useState<number | null>(null);
  const revealed = revealedAt === session.position;

  if (isComplete(session)) return <Summary session={session} onDone={onDone} />;

  const card = currentCard(session)!;
  const word = wordById.get(card.id);
  if (!word) {
    // The word was removed from the data file mid-session: skip it without scheduling.
    return (
      <section className="session">
        <p className="muted">המילה הוסרה מהרשימה.</p>
        <button className="primary" onClick={onSkip}>
          הבא
        </button>
      </section>
    );
  }

  const answer = (rating: Rating) => {
    setRevealedAt(null);
    onAnswer(rating);
  };

  return (
    <section className="session">
      <div className="session-top">
        <button className="link" onClick={onDone}>
          ✕
        </button>
        <span className="muted">
          {session.position + 1} מתוך {session.cards.length}
        </span>
      </div>

      <button className="card" onClick={() => setRevealedAt(session.position)} disabled={revealed}>
        <span className="card-word" lang="en" dir="ltr">
          {word.word}
        </span>
        {revealed ? (
          <span className="card-back">
            <span className="card-pos">{POS_HE[word.pos]}</span>
            <span className="card-he">{word.he}</span>
            <span className="card-example" lang="en" dir="ltr">
              {word.example}
            </span>
          </span>
        ) : (
          <span className="muted">הקישי כדי לראות תרגום</span>
        )}
      </button>

      {revealed && (
        <FlagControl
          key={session.position}
          flagged={isFlagged(word.id)}
          onFlag={(note) => onFlag(word, note)}
          onUnflag={() => onUnflag(word.id)}
        />
      )}

      <div className="actions">
        {revealed ? (
          <>
            <button className="primary" onClick={() => answer('knew')}>
              ידעתי
            </button>
            <button className="secondary" onClick={() => answer('didnt')}>
              לא ידעתי
            </button>
          </>
        ) : (
          card.kind === 'new' && (
            <button className="secondary" onClick={() => answer('known')}>
              אני כבר יודעת
            </button>
          )
        )}
      </div>
    </section>
  );
}

/** "Wrong translation" report for the revealed card (FR-021). Never blocks studying. */
function FlagControl({
  flagged,
  onFlag,
  onUnflag,
}: {
  flagged: boolean;
  onFlag: (note: string) => void;
  onUnflag: () => void;
}) {
  const [noting, setNoting] = useState(false);
  const [note, setNote] = useState('');

  if (flagged) {
    return (
      <button className="flag flagged" onClick={onUnflag}>
        דווח ✓ (הקישי לביטול)
      </button>
    );
  }
  if (!noting) {
    return (
      <button className="flag" onClick={() => setNoting(true)}>
        תרגום שגוי?
      </button>
    );
  }
  return (
    <div className="flag-form">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="מה התרגום הנכון? (לא חובה)"
        rows={2}
        maxLength={300}
      />
      <div className="flag-buttons">
        <button
          className="secondary"
          onClick={() => {
            onFlag(note);
            setNote('');
            setNoting(false);
          }}
        >
          שליחת דיווח
        </button>
        <button
          className="link"
          onClick={() => {
            setNote('');
            setNoting(false);
          }}
        >
          ביטול
        </button>
      </div>
    </div>
  );
}

function Summary({ session, onDone }: { session: SessionT; onDone: () => void }) {
  const s = summarize(session);
  const acc = accuracy(s);
  return (
    <section className="session summary">
      <h2>כל הכבוד! סיימת את הסשן 🎉</h2>
      <dl className="summary-list">
        <dt>מילים חדשות</dt>
        <dd>{s.newCount}</dd>
        <dt>כבר ידעת</dt>
        <dd>{s.knownCount}</dd>
        <dt>חזרות</dt>
        <dd>{s.reviewCount}</dd>
        <dt>דיוק</dt>
        <dd>{acc === null ? '—' : `${Math.round(acc * 100)}%`}</dd>
      </dl>
      <button className="primary big" onClick={onDone}>
        חזרה לבית
      </button>
    </section>
  );
}
