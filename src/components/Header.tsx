"use client";
import styles from "./Header.module.css";

interface HeaderProps {
  status: "idle" | "loading" | "live" | "error";
  countdown: number;
  onRefresh: () => void;
  totalPosts: number;
  totalViews: number;
  lastUpdate: string;
}

export default function Header({ status, countdown, onRefresh, totalPosts, totalViews, lastUpdate }: HeaderProps) {
  const statusLabel = status === "live" ? "в эфире" : status === "loading" ? "синхронизация..." : status === "error" ? "ошибка" : "ожидание";
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.left}>
          <span className={styles.logo}>THREADS OS</span>
          <span className={styles.subtitle}>Nexus Control Center</span>
        </div>
        <div className={styles.right}>
          <div className={styles.statusGroup}>
            <span className={styles.dot} data-status={status} aria-hidden="true" />
            <span className={styles.statusText}>{statusLabel}</span>
            {status === "live" && <span className={styles.countdown}>{countdown}с</span>}
          </div>
          <button className={styles.refreshBtn} onClick={onRefresh} disabled={status === "loading"} aria-label="Обновить">↻</button>
        </div>
      </div>
      {totalPosts > 0 && (
        <div className={styles.meta}>
          <span>{totalPosts} постов</span>
          <span className={styles.dot2} />
          <span>{(totalViews / 1000).toFixed(1)}K просмотров</span>
          <span className={styles.dot2} />
          <span>обновлено {lastUpdate}</span>
        </div>
      )}
    </header>
  );
}
