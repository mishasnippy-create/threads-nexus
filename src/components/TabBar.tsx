"use client";
import styles from "./TabBar.module.css";

export type Tab = "feed" | "analytics" | "timeline";

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "feed", label: "Лента", icon: "▤" },
  { id: "analytics", label: "Аналитика", icon: "◈" },
  { id: "timeline", label: "Таймлайн", icon: "◎" },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className={styles.bar} role="tablist" aria-label="Разделы">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`${styles.tab} ${active === tab.id ? styles.active : ""}`}
          onClick={() => onChange(tab.id)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
          {active === tab.id && <span className={styles.indicator} />}
        </button>
      ))}
    </nav>
  );
}
