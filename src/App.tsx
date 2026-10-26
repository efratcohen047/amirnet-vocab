import { useEffect, useReducer, useState } from 'react';
import {
  answer,
  buildSession,
  emptyDay,
  isRestDay,
  nextDue,
  shouldResume,
  skip,
  type StudyState,
} from './core/session';
import Home, { type HomeStatus } from './screens/Home';
import Progress from './screens/Progress';
import Session from './screens/Session';
import Settings from './screens/Settings';
import { store } from './storage';
import { getToday } from './today';
import type { FlagMap, History, ProgressMap, Rating, Session as SessionT, Settings as SettingsT } from './types';
import { wordById, words } from './words';

type View = 'home' | 'session' | 'progress' | 'settings';

const NAV: { view: View; label: string }[] = [
  { view: 'home', label: 'בית' },
  { view: 'progress', label: 'התקדמות' },
  { view: 'settings', label: 'הגדרות' },
];

/** State that lives on the device; every setter saves immediately (FR-014). */
function usePersisted<T>(loadFn: () => T, saveFn: (v: T) => void): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(loadFn);
  const set = (v: T) => {
    saveFn(v);
    setValue(v);
  };
  return [value, set];
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [progress, setProgress] = usePersisted<ProgressMap>(store.loadProgress, store.saveProgress);
  const [session, setSession] = usePersisted<SessionT | null>(store.loadSession, store.saveSession);
  const [history, setHistory] = usePersisted<History>(store.loadHistory, store.saveHistory);
  const [settings, setSettings] = usePersisted<SettingsT>(store.loadSettings, store.saveSettings);
  const [flags, setFlags] = usePersisted<FlagMap>(store.loadFlags, store.saveFlags);
  void flags, setFlags; // Used by flagging (US4).

  // Re-render when she comes back to the app, so "today" moves on after midnight.
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const today = getToday();
  const now = () => new Date().toISOString();
  const restDay = isRestDay(words, progress, today);

  // Opening the app on a day with nothing to study keeps the streak alive (FR-018).
  useEffect(() => {
    if (restDay && !history[today]?.rest) {
      setHistory({ ...history, [today]: { ...(history[today] ?? emptyDay()), rest: true } });
    }
  });

  const setStudy = (next: StudyState) => {
    setSession(next.session);
    setProgress(next.progress);
    setHistory(next.history);
  };

  const canResume = shouldResume(session, today, now());
  const doneToday = !!history[today]?.completed;
  const status: HomeStatus = canResume ? 'resume' : doneToday ? 'done' : restDay ? 'rest' : 'start';

  const start = () => {
    if (!canResume) setSession(buildSession(words, progress, settings, today, now()));
    setView('session');
  };

  const onAnswer = (rating: Rating) => {
    if (session) setStudy(answer({ session, progress, history }, rating, { words, today, now: now() }));
  };

  const onSkip = () => {
    if (session) setStudy(skip({ session, progress, history }, now()));
  };

  if (view === 'session' && session) {
    return (
      <div className="app">
        <main className="screen">
          <Session
            session={session}
            wordById={wordById}
            onAnswer={onAnswer}
            onSkip={onSkip}
            onDone={() => setView('home')}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="screen">
        {view !== 'progress' && view !== 'settings' && (
          <Home
            status={status}
            nextDue={nextDue(words, progress, today)}
            noNewWords={words.every((w) => progress[w.id])}
            onStart={start}
          />
        )}
        {view === 'progress' && <Progress />}
        {view === 'settings' && <Settings settings={settings} onChange={setSettings} />}
      </main>
      <nav className="nav">
        {NAV.map((n) => (
          <button
            key={n.view}
            className={view === n.view ? 'nav-item active' : 'nav-item'}
            onClick={() => setView(n.view)}
          >
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
