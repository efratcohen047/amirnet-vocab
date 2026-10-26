import type { Settings as SettingsT } from '../types';

interface Props {
  settings: SettingsT;
  onChange: (s: SettingsT) => void;
}

export default function Settings(_: Props) {
  return <h1>הגדרות</h1>;
}
