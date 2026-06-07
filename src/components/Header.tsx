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

export default function Header({ status, countdown, onRefresh }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logoWrap}>
          <span className={styles.logo}>THREADS OS</span>
          <span className={styles.statusGroup}>
            <span className={styles.dot} data-status={status} aria-hidden="true" />
            <span className={styles.statusText}>
              {status === "live" ? "в эфире" : status === "loading" ? "синхронизация..." : status === "error" ? "ошибка" : "ожидание"}
            </span>
            {status === "live" && <span className={styles.countdown}>{countdown}с</span>}
          </span>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={onRefresh}
          disabled={status === "loading"}
          aria-label="Обновить"
        >
          ↻
        </button>
      </div>
    </header>
  );
}
