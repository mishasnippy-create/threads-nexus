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
  const er = post.views > 0 ? ((post.likes / post.views) * 100).toFixed(2) : "0.00";

  return (
    <article className={`${styles.card} ${isTop ? styles.topCard : ""}`}>
      {isTop && <span className={styles.topBadge}>ТОП</span>}
      <p className={styles.text}>{text}</p>
      <div className={styles.meta}>
        {post.category && <span className={styles.cat}>{post.category}</span>}
        <span className={styles.stat}><span className={styles.ico}>◎</span><span className={styles.val}>{fmt(post.views)}</span></span>
        <span className={styles.stat}><span className={styles.ico}>♥</span><span className={styles.val}>{fmt(post.likes)}</span></span>
        <span className={styles.stat}><span className={styles.ico}>⟳</span><span className={styles.val}>{fmt(post.reposts)}</span></span>
        <span className={`${styles.stat} ${styles.scoreStat}`}><span className={styles.ico}>★</span><span className={styles.val}>{fmt(post.score)}</span></span>
        <span className={`${styles.stat} ${styles.erStat}`}><span className={styles.ico}>%</span><span className={styles.val}>{er}</span></span>
        {post.time && <span className={styles.time}>{timeAgo(post.time)}</span>}
      </div>
      {Number(post.score) > 0 && (
        <div className={styles.barWrap}>
          <div className={styles.bar} style={{ width: `${scorePercent}%` }} />
        </div>
      )}
    </article>
  );
}
