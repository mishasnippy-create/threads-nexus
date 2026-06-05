import { Post } from "@/lib/types";
import { fmt, timeAgo } from "@/lib/utils";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: Post;
  isTop: boolean;
  scorePercent: number;
}

export default function PostCard({ post, isTop, scorePercent }: PostCardProps) {
  const text =
    post.text.length > 300 ? post.text.slice(0, 300) + "…" : post.text;

  return (
    <article
      className={`${styles.card} ${isTop ? styles.topCard : ""}`}
      aria-label={isTop ? "Top performing post" : "Post"}
    >
      {isTop && (
        <span className={`${styles.topBadge} mono`} aria-label="Top post">
          TOP
        </span>
      )}

      <p className={styles.text}>{text}</p>

      <div className={styles.meta}>
        {post.category && (
          <span className={`${styles.cat} mono`}>{post.category}</span>
        )}
        <span className={`${styles.stat} mono`}>
          <span className={styles.icon}>◎</span>
          {fmt(post.views)}
        </span>
        <span className={`${styles.stat} mono`}>
          <span className={styles.icon}>♥</span>
          {fmt(post.likes)}
        </span>
        <span className={`${styles.stat} mono`}>
          <span className={styles.icon}>⟳</span>
          {fmt(post.reposts)}
        </span>
        <span className={`${styles.stat} ${styles.scoreVal} mono`}>
          <span className={styles.icon}>★</span>
          {fmt(post.score)}
        </span>
        {post.time && (
          <span className={`${styles.time} mono`}>{timeAgo(post.time)}</span>
        )}
      </div>

      {Number(post.score) > 0 && (
        <div className={styles.barWrap} role="presentation">
          <div
            className={styles.bar}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      )}
    </article>
  );
}
