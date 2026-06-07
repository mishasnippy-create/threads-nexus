"use client";
import { Post } from "@/lib/types";
import { fmt } from "@/lib/utils";
import styles from "./Timeline.module.css";

interface Props { posts: Post[]; }

function formatDate(ts: string): string {
  try {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Сегодня";
    if (d.toDateString() === yesterday.toDateString()) return "Вчера";
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ts; }
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

export default function Timeline({ posts }: Props) {
  if (posts.length === 0) {
    return <div className={styles.empty}>◌<br />Нет публикаций</div>;
  }

  const sorted = [...posts].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const groups: { date: string; posts: Post[] }[] = [];
  sorted.forEach((p) => {
    const d = formatDate(p.time);
    const last = groups[groups.length - 1];
    if (last && last.date === d) { last.posts.push(p); }
    else { groups.push({ date: d, posts: [p] }); }
  });

  return (
    <div className={styles.wrap}>
      {groups.map((group, gi) => (
        <div key={gi} className={styles.group}>
          <div className={styles.dateHeader}>
            <span className={styles.dateLine} />
            <span className={styles.dateLabel}>{group.date}</span>
            <span className={styles.dateLine} />
          </div>
          <div className={styles.entries}>
            {group.posts.map((post, pi) => {
              const er = post.views > 0 ? ((post.likes / post.views) * 100).toFixed(2) : "0.00";
              return (
                <article key={pi} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.time}>{formatTime(post.time)}</span>
                    {post.category && <span className={styles.cat}>{post.category}</span>}
                  </div>
                  <p className={styles.text}>{post.text}</p>
                  <div className={styles.meta}>
                    <span className={styles.stat}><span className={styles.ico}>🔍</span>{fmt(post.views)}</span>
                    <span className={styles.stat}><span className={styles.ico}>❤️</span>{fmt(post.likes)}</span>
                    <span className={styles.stat}><span className={styles.ico}>🔁</span>{fmt(post.reposts)}</span>
                    <span className={`${styles.stat} ${styles.score}`}><span className={styles.ico}>⚡</span>{fmt(post.score)}</span>
                    <span className={styles.stat}><span className={styles.ico}>📊</span>{er}%</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
