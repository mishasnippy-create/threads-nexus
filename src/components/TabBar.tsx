'use client';
import { TabId } from '@/lib/types';
import styles from './TabBar.module.css';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'feed', label: 'Лента', icon: '▤' },
  { id: 'analytics', label: 'Аналитика', icon: '◈' },
  { id: 'timeline', label: 'Таймлайн', icon: '◑' },
];

export default function TabBar({ active, onChange }: Props) {
  return (
    <nav className={styles.bar}>
      {tabs.map(({ id, label, icon }) => (
        <button
          key={id}
          className={`${styles.tab} ${active === id ? styles.active : ''}`}
          onClick={() => onChange(id)}
        >
          <span className={styles.icon}>{icon}</span>
          <span className={styles.label}>{label}</span>
          {active === id && <span className={styles.indicator} />}
        </button>
      ))}
    </nav>
  );
}
