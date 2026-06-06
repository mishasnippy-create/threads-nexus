"use client";
import styles from "./FilterBar.module.css";

interface FilterBarProps {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function FilterBar({ categories, active, onChange }: FilterBarProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.bar} role="group" aria-label="Фильтр по категории">
        <button className={`${styles.btn} ${active === "all" ? styles.active : ""}`} onClick={() => onChange("all")}>Все</button>
        {categories.map((cat) => (
          <button key={cat} className={`${styles.btn} ${active === cat ? styles.active : ""}`} onClick={() => onChange(cat)}>{cat}</button>
        ))}
      </div>
    </div>
  );
}
