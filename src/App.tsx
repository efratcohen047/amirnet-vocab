import { useState } from 'react';
import Home from './screens/Home';
import Progress from './screens/Progress';
import Settings from './screens/Settings';
import { store } from './storage';
import type { FlagMap, History, ProgressMap, Session, Settings as SettingsT } from './types';

type View = 'home' | 'session' | 'progress' | 'settings';

const NAV: { view: View; label: string }[] = [
  { view: 'home', label: 'בית' },
  { view: 'progress', label: 'התקדמות' },
  { view: 'settings', label: 'הגדרות' },
];

/** State that lives on the device; every setter saves immediately. */
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
  const [session, setSession] = usePersisted<Session | null>(store.loadSession, store.saveSession);
  const [history, setHistory] = usePersisted<History>(store.loadHistory, store.saveHistory);
  const [settings, setSettings] = usePersisted<SettingsT>(store.loadSettings, store.saveSettings);
  const [flags, setFlags] = usePersisted<FlagMap>(store.loadFlags, store.saveFlags);

  // Wired up by the user-story screens.
  void progress, setProgress, session, setSession, history, setHistory, flags, setFlags;

  return (
    <div className="app">
      <main className="screen">
        {view === 'home' && <Home />}
        {view === 'progress' && <Progress />}
        {view === 'settings' && <Settings settings={settings} onChange={setSettings} />}
      </main>
      {view !== 'session' && (
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
      )}
    </div>
  );
}
