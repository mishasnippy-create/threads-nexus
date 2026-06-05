"use client";

import styles from "./Header.module.css";

interface HeaderProps {
  status: "idle" | "loading" | "live" | "error";
  countdown: number;
  onRefresh: () => void;
}

export default function Header({ status, countdown, onRefresh }: HeaderProps) {
  const statusLabel =
    status === "live"
      ? "live"
      : status === "loading"
      ? "connecting..."
      : status === "error"
      ? "error"
      : "idle";

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={`${styles.title} mono`}>THREADS NEXUS</span>
        <span className={styles.subtitle}>live system dashboard</span>
      </div>
      <div className={styles.right}>
        <span
          className={styles.dot}
          data-status={status}
          aria-hidden="true"
        />
        <span className={`${styles.statusText} mono`}>{statusLabel}</span>
        {status === "live" && (
          <span className={`${styles.countdown} mono`}>
            refresh in {countdown}s
          </span>
        )}
        <button
          className={`${styles.refreshBtn} mono`}
          onClick={onRefresh}
          disabled={status === "loading"}
          aria-label="Refresh data"
        >
          ↻ refresh
        </button>
      </div>
    </header>
  );
}
