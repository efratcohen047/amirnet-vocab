import type { Settings as SettingsT } from '../types';

const MIN_NEW = 5;
const MAX_NEW = 50;
const STEP = 5;

interface Props {
  settings: SettingsT;
  onChange: (s: SettingsT) => void;
}

export default function Settings({ settings, onChange }: Props) {
  const setNew = (n: number) => onChange({ ...settings, newPerDay: Math.min(MAX_NEW, Math.max(MIN_NEW, n)) });

  return (
    <section className="settings">
      <h1>הגדרות</h1>

      <div className="setting">
        <span className="setting-label">מילים חדשות ביום</span>
        <div className="stepper">
          <button
            aria-label="פחות"
            onClick={() => setNew(settings.newPerDay - STEP)}
            disabled={settings.newPerDay <= MIN_NEW}
          >
            −
          </button>
          <span className="stepper-value">{settings.newPerDay}</span>
          <button
            aria-label="יותר"
            onClick={() => setNew(settings.newPerDay + STEP)}
            disabled={settings.newPerDay >= MAX_NEW}
          >
            +
          </button>
        </div>
        <p className="muted">ייכנס לתוקף מהסשן הבא</p>
      </div>
    </section>
  );
}
