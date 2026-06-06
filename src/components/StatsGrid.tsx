import { Stats } from "@/lib/types";
import { fmt } from "@/lib/utils";
import styles from "./StatsGrid.module.css";

interface StatsGridProps { stats: Stats | null; loading: boolean; }

const CARDS = [
  { key: "views" as keyof Stats, label: "просмотры", icon: "◎", accent: false },
  { key: "likes" as keyof Stats, label: "лайки", icon: "♥", accent: false },
  { key: "reposts" as keyof Stats, label: "репосты", icon: "⟳", accent: false },
  { key: "score" as keyof Stats, label: "score", icon: "★", accent: true },
  { key: "posts" as keyof Stats, label: "постов", icon: "▤", accent: false },
];

export default function StatsGrid({ stats, loading }: StatsGridProps) {
  return (
    <div className={styles.grid} role="region" aria-label="Сводная статистика">
      {CARDS.map(({ key, label, icon, accent }) => (
        <div key={key} className={styles.card}>
          <div className={`${styles.label} mono`}>{label}</div>
          <div className={`${styles.value} ${accent ? styles.accent : ""} ${loading ? styles.shimmer : ""}`}>
            {stats ? fmt(stats[key]) : "—"}
          </div>
          <span className={styles.icon} aria-hidden="true">{icon}</span>
        </div>
      ))}
    </div>
  );
}
