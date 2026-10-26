import { useState } from 'react';
import type { LocalDate, Settings as SettingsT } from '../types';

const MIN_NEW = 5;
const MAX_NEW = 50;
const STEP = 5;

interface Props {
  settings: SettingsT;
  onChange: (s: SettingsT) => void;
  flagCount: number;
  exportFlags: () => string;
  today: LocalDate;
}

/** Share sheet on phones; otherwise copy to the clipboard and download (contracts/flag-export.md). */
async function deliver(csv: string, today: LocalDate): Promise<string> {
  if (navigator.share) {
    try {
      await navigator.share({ title: `Amirnet flags ${today}`, text: csv });
      return '';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return '';
    }
  }
  try {
    await navigator.clipboard?.writeText(csv);
  } catch {
    // Clipboard blocked: the download below still works.
  }
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `amirnet-flags-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return 'הדיווחים הועתקו והורדו כקובץ.';
}

export default function Settings({ settings, onChange, flagCount, exportFlags, today }: Props) {
  const [message, setMessage] = useState('');
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

      <div className="setting">
        <span className="setting-label">דיווחי תרגום</span>
        <p className="muted">
          {flagCount ? `${flagCount} דיווחים פתוחים` : 'כשמסמנים "תרגום שגוי" בכרטיס, הדיווח נשמר כאן.'}
        </p>
        <button
          className="primary"
          disabled={!flagCount}
          onClick={async () => setMessage(await deliver(exportFlags(), today))}
        >
          {flagCount ? 'שליחת הדיווחים' : 'אין דיווחים'}
        </button>
        {message && <p className="muted">{message}</p>}
      </div>
    </section>
  );
}
