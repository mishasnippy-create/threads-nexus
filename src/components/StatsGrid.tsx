import { Stats } from "@/lib/types";
import { fmt } from "@/lib/utils";
import styles from "./StatsGrid.module.css";

interface StatsGridProps {
  stats: Stats | null;
  loading: boolean;
}

const CARDS = [
  { key: "views" as keyof Stats, label: "views", icon: "◎" },
  { key: "likes" as keyof Stats, label: "likes", icon: "♥" },
  { key: "reposts" as keyof Stats, label: "reposts", icon: "⟳" },
  { key: "score" as keyof Stats, label: "score", icon: "★" },
  { key: "posts" as keyof Stats, label: "posts", icon: "▤" },
];

export default function StatsGrid({ stats, loading }: StatsGridProps) {
  return (
    <div className={styles.grid} role="region" aria-label="Summary statistics">
      {CARDS.map(({ key, label, icon }) => (
        <div key={key} className={styles.card}>
          <div className={`${styles.label} mono`}>{label}</div>
          <div className={`${styles.value} mono ${loading ? styles.shimmer : ""}`}>
            {stats ? fmt(stats[key]) : "—"}
          </div>
          <span className={styles.icon} aria-hidden="true">{icon}</span>
        </div>
      ))}
    </div>
  );
}
