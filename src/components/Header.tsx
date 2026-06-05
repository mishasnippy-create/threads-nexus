"use client";

import styles from "./Header.module.css";

interface HeaderProps {
  status: "idle" | "loading" | "live" | "error";
  countdown: number;
  onRefresh: () => void;
}

export default function Header({ status, countdown, onRefresh }: HeaderProps) {
  const statusLabel =
    status === "live" ? "live"
    : status === "loading" ? "sync..."
    : status === "error" ? "error"
    : "idle";

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.title}>THREADS NEXUS</span>
        <span className={styles.subtitle}>live system dashboard</span>
      </div>
      <div className={styles.right}>
        <div className={styles.statusGroup}>
          <span className={styles.dot} data-status={status} aria-hidden="true" />
          <span className={styles.statusText}>{statusLabel}</span>
          {status === "live" && (
            <span className={styles.countdown}>{countdown}s</span>
          )}
        </div>
        <button
          className={styles.refreshBtn}
          onClick={onRefresh}
          disabled={status === "loading"}
          aria-label="Refresh data"
          title="Refresh"
        >
          ↻
        </button>
      </div>
    </header>
  );
}
