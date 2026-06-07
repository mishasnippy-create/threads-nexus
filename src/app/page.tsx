"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import StatsGrid from "@/components/StatsGrid";
import FilterBar from "@/components/FilterBar";
import PostCard from "@/components/PostCard";
import TabBar, { Tab } from "@/components/TabBar";
import Analytics from "@/components/Analytics";
import Timeline from "@/components/Timeline";
import { Post, Stats } from "@/lib/types";
import { API_URL, timeAgo } from "@/lib/utils";
import styles from "./page.module.css";

const REFRESH_INTERVAL = 45;
type Status = "idle" | "loading" | "live" | "error";

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [categories, setCategories] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("feed");
  const [lastUpdate, setLastUpdate] = useState("");
  const [showAllFeed, setShowAllFeed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const startCountdown = useCallback(() => {
    setCountdown(REFRESH_INTERVAL);
    clearTimers();
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL : c - 1));
    }, 1000);
    timerRef.current = setTimeout(() => fetchData(), REFRESH_INTERVAL * 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = useCallback(async () => {
    clearTimers();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`${API_URL}?t=${Date.now()}`);
      const raw = await res.text();
      let data: unknown;
      try { data = JSON.parse(raw); } catch {
        throw new Error(`Ошибка парсинга JSON:\n\n${raw.slice(0, 500)}`);
      }

      let rawPosts: Post[] = [];
      if (Array.isArray(data)) { rawPosts = data as Post[]; }
      else if (data && typeof data === "object" && "posts" in data && Array.isArray((data as { posts: unknown }).posts)) {
        rawPosts = (data as { posts: Post[] }).posts;
      } else { throw new Error(`Неожиданный формат API:\n\n${JSON.stringify(data).slice(0, 400)}`); }

      const validPosts = rawPosts
        .filter((p) => p && typeof p === "object")
        .map((p) => ({ ...p, views: Number(p.views) || 0, likes: Number(p.likes) || 0, reposts: Number(p.reposts) || 0, score: Number(p.score) || 0 }))
        .sort((a, b) => b.score - a.score);

      const totViews = validPosts.reduce((s, p) => s + p.views, 0);
      const totLikes = validPosts.reduce((s, p) => s + p.likes, 0);
      const totReposts = validPosts.reduce((s, p) => s + p.reposts, 0);
      const totScore = validPosts.reduce((s, p) => s + p.score, 0);
      const cats = Array.from(new Set(validPosts.map((p) => p.category).filter(Boolean)));

      setPosts(validPosts);
      setStats({ views: totViews, likes: totLikes, reposts: totReposts, score: totScore, posts: validPosts.length });
      setCategories(cats);
      setLastUpdate(timeAgo(new Date().toISOString()));
      setStatus("live");
      startCountdown();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
      setStatus("error");
    }
  }, [startCountdown]);

  useEffect(() => {
    fetchData();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      if (status === "live") setLastUpdate((prev) => prev);
    }, 10000);
    return () => clearInterval(iv);
  }, [status]);

  const filtered = filter === "all" ? posts : posts.filter((p) => p.category === filter);
  // Top-5 by likes for feed preview
  const topByLikes = [...filtered].sort((a, b) => b.likes - a.likes);
  const feedPosts = showAllFeed ? filtered : topByLikes.slice(0, 5);
  const maxScore = Math.max(...filtered.map((p) => p.score), 1);

  return (
    <div className={styles.page}>
      <Header
        status={status}
        countdown={countdown}
        onRefresh={fetchData}
        totalPosts={stats?.posts ?? 0}
        totalViews={stats?.views ?? 0}
        lastUpdate={lastUpdate}
      />

      <main className={styles.main}>
        <StatsGrid stats={stats} loading={status === "loading"} />

        {error && (
          <div className={styles.errorBox} role="alert">
            <span className={styles.errorLabel}>ОШИБКА</span>
            <pre className={styles.errorText}>{error}</pre>
          </div>
        )}

        {/* ЛЕНТА */}
        {tab === "feed" && (
          <div className={styles.feedSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                {showAllFeed ? "Все посты" : "Топ постов"}
              </span>
              <span className={styles.feedCount}>{filtered.length} постов</span>
            </div>
            <FilterBar categories={categories} active={filter} onChange={setFilter} />
            <div className={styles.feed} role="feed">
              {status === "loading" && posts.length === 0 ? (
                <div className={styles.emptyState}><span className={styles.emptyIcon}>◌</span>Загружаем данные...</div>
              ) : filtered.length === 0 ? (
                <div className={styles.emptyState}><span className={styles.emptyIcon}>◌</span>{posts.length === 0 ? "Постов пока нет" : "В этой категории нет постов"}</div>
              ) : (
                feedPosts.map((post, i) => (
                  <PostCard
                    key={`${post.threadId || post.id}-${i}`}
                    post={post}
                    isTop={i === 0 && post.score > 0}
                    scorePercent={Math.round((post.score / maxScore) * 100)}
                  />
                ))
              )}
            </div>
            {filtered.length > 5 && (
              <button
                className={styles.showAllBtn}
                onClick={() => setShowAllFeed((v) => !v)}
              >
                {showAllFeed ? "Свернуть" : `Показать все ${filtered.length} постов`}
              </button>
            )}
          </div>
        )}

        {/* АНАЛИТИКА */}
        {tab === "analytics" && <Analytics posts={posts} />}

        {/* ТАЙМЛАЙН */}
        {tab === "timeline" && <Timeline posts={posts} />}
      </main>

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
