"use client";

import styles from "./FilterBar.module.css";

interface FilterBarProps {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function FilterBar({
  categories,
  active,
  onChange,
}: FilterBarProps) {
  return (
    <div className={styles.bar} role="group" aria-label="Filter by category">
      <button
        className={`${styles.btn} mono ${active === "all" ? styles.active : ""}`}
        onClick={() => onChange("all")}
        aria-pressed={active === "all"}
      >
        ALL
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`${styles.btn} mono ${active === cat ? styles.active : ""}`}
          onClick={() => onChange(cat)}
          aria-pressed={active === cat}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
