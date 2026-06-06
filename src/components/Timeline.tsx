'use client';
import { Post } from '@/lib/types';
import { fmt, engagementRate, timeAgo } from '@/lib/utils';
import styles from './Timeline.module.css';

interface Props { posts: Post[]; }

function groupByDate(posts: Post[]) {
  const groups = new Map<string, Post[]>();
  for (const p of posts) {
    const d = p.published_at || p.timestamp || p.date || '';
    let key = 'Без даты';
    if (d) {
      try {
        key = new Date(d).toLocaleDateString('ru-RU', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
      } catch {}
    }
    const g = groups.get(key) || [];
    g.push(p);
    groups.set(key, g);
  }
  return Array.from(groups.entries());
}

export default function Timeline({ posts }: Props) {
  const grouped = groupByDate(posts);

  if (!posts.length) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>◌</span>
        <p>Нет данных</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {grouped.map(([date, items]) => (
        <div key={date} className={styles.group}>
          <div className={styles.dateLabel}>
            <span className={styles.dateLine} />
            <span className={styles.dateText}>{date}</span>
            <span className={styles.dateLine} />
          </div>

          {items.map((post, i) => (
            <div key={post.id || i} className={styles.item}>
              <div className={styles.spine}>
                <div className={styles.dot} />
                {i < items.length - 1 && <div className={styles.line} />}
              </div>
              <div className={styles.content}>
                <div className={styles.itemMeta}>
                  {post.hour !== undefined && (
                    <span className={styles.itemHour}>{post.hour}:00</span>
                  )}
                  {post.category && (
                    <span className={styles.itemCat}>{post.category}</span>
                  )}
                </div>
                <p className={styles.itemText}>{post.text}</p>
                <div className={styles.itemStats}>
                  <span style={{ color: 'var(--green)' }}>◎ {fmt(post.views)}</span>
                  <span style={{ color: 'var(--violet)' }}>♥ {fmt(post.likes)}</span>
                  <span style={{ color: 'var(--blue)' }}>⟳ {fmt(post.reposts)}</span>
                  <span className={styles.itemScore}>★ {fmt(post.score)}</span>
                  <span className={styles.itemEr}>{engagementRate(post.likes, post.views)} ER</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
