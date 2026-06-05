import { Post } from "@/lib/types";
import { fmt, timeAgo } from "@/lib/utils";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: Post;
  isTop: boolean;
  scorePercent: number;
}

export default function PostCard({ post, isTop, scorePercent }: PostCardProps) {
  const text = post.text.length > 320 ? post.text.slice(0, 320) + "…" : post.text;

  return (
    <article
      className={`${styles.card} ${isTop ? styles.topCard : ""}`}
      aria-label={isTop ? "Top performing post" : "Post"}
    >
      {isTop && (
        <span className={styles.topBadge} aria-label="Top post">TOP</span>
      )}

      <p className={styles.text}>{text}</p>

      <div className={styles.meta}>
        {post.category && (
          <span className={styles.cat}>{post.category}</span>
        )}
        <span className={styles.stat}>
          <span className={styles.icon}>◎</span>
          <span className={styles.statVal}>{fmt(post.views)}</span>
        </span>
        <span className={styles.stat}>
          <span className={styles.icon}>♥</span>
          <span className={styles.statVal}>{fmt(post.likes)}</span>
        </span>
        <span className={styles.stat}>
          <span className={styles.icon}>⟳</span>
          <span className={styles.statVal}>{fmt(post.reposts)}</span>
        </span>
        <span className={`${styles.stat} ${styles.scoreVal}`}>
          <span className={styles.icon}>★</span>
          <span className={styles.statVal}>{fmt(post.score)}</span>
        </span>
        {post.time && (
          <span className={styles.time}>{timeAgo(post.time)}</span>
        )}
      </div>

      {Number(post.score) > 0 && (
        <div className={styles.barWrap} role="presentation">
          <div className={styles.bar} style={{ width: `${scorePercent}%` }} />
        </div>
      )}
    </article>
  );
}
