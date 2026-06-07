"use client";
import { useEffect, useRef, useState } from "react";
import { Post } from "@/lib/types";
import styles from "./Analytics.module.css";

interface Props { posts: Post[]; }

type Period = "today" | "yesterday" | "week" | "month";
type Metric = "views" | "likes" | "reposts" | "score";

const METRIC_LABELS: Record<Metric, string> = {
  views: "Просмотры",
  likes: "Лайки",
  reposts: "Репосты",
  score: "Score",
};

const COLORS = {
  views: "#c8ff00",
  likes: "#a78bfa",
  reposts: "#4d9eff",
  score: "#ff8c42",
};

function startOf(d: Date) {
  const c = new Date(d);
  c.setHours(0,0,0,0);
  return c;
}

function getPeriodPosts(posts: Post[], period: Period): Post[] {
  const now = new Date();
  const todayStart = startOf(now).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;
  const monthStart = todayStart - 29 * 86400000;

  return posts.filter((p) => {
    const t = new Date(p.time).getTime();
    if (period === "today") return t >= todayStart;
    if (period === "yesterday") return t >= yesterdayStart && t < todayStart;
    if (period === "week") return t >= weekStart;
    if (period === "month") return t >= monthStart;
    return true;
  });
}

// Build day-by-day data for period
function getDayData(posts: Post[], period: Period): { label: string; views: number; posts: number }[] {
  const now = new Date();
  const todayStart = startOf(now);
  let days = 1;
  if (period === "today" || period === "yesterday") days = 1;
  else if (period === "week") days = 7;
  else if (period === "month") days = 30;

  const result: { label: string; views: number; posts: number }[] = [];

  if (period === "yesterday") {
    const yStart = new Date(todayStart.getTime() - 86400000);
    const dayPosts = posts.filter((p) => {
      const t = new Date(p.time).getTime();
      return t >= yStart.getTime() && t < todayStart.getTime();
    });
    // hourly for single day
    for (let h = 0; h < 24; h++) {
      const hourPosts = dayPosts.filter((p) => new Date(p.time).getHours() === h);
      result.push({
        label: `${h}:00`,
        views: hourPosts.reduce((s, p) => s + p.views, 0),
        posts: hourPosts.length,
      });
    }
    return result;
  }

  if (period === "today") {
    // hourly
    const dayPosts = posts.filter((p) => new Date(p.time).getTime() >= todayStart.getTime());
    for (let h = 0; h <= new Date().getHours(); h++) {
      const hourPosts = dayPosts.filter((p) => new Date(p.time).getHours() === h);
      result.push({
        label: `${h}:00`,
        views: hourPosts.reduce((s, p) => s + p.views, 0),
        posts: hourPosts.length,
      });
    }
    return result;
  }

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(todayStart.getTime() - i * 86400000);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const dayPosts = posts.filter((p) => {
      const t = new Date(p.time).getTime();
      return t >= dayStart.getTime() && t < dayEnd.getTime();
    });
    const label = dayStart.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    result.push({
      label,
      views: dayPosts.reduce((s, p) => s + p.views, 0),
      posts: dayPosts.length,
    });
  }
  return result;
}

const PERIOD_LABELS: Record<Period, string> = {
  today: "Сегодня",
  yesterday: "Вчера",
  week: "Неделя",
  month: "Месяц",
};

export default function Analytics({ posts }: Props) {
  const hourRef = useRef<HTMLCanvasElement>(null);
  const catRef = useRef<HTMLCanvasElement>(null);
  const trendRef = useRef<HTMLCanvasElement>(null);
  const dayRef = useRef<HTMLCanvasElement>(null);

  const [period, setPeriod] = useState<Period>("week");
  const [catMetric, setCatMetric] = useState<Metric>("views");

  const periodPosts = getPeriodPosts(posts, period);
  const dayData = getDayData(posts, period);

  // Category stats across ALL posts
  const catStats: Record<string, Record<Metric, number> & { count: number }> = {};
  posts.forEach((p) => {
    const c = p.category || "Без категории";
    if (!catStats[c]) catStats[c] = { views: 0, likes: 0, reposts: 0, score: 0, count: 0 };
    catStats[c].views += p.views;
    catStats[c].likes += p.likes;
    catStats[c].reposts += p.reposts;
    catStats[c].score += p.score;
    catStats[c].count += 1;
  });
  const cats = Object.keys(catStats).sort(
    (a, b) => (catStats[b][catMetric] / catStats[b].count) - (catStats[a][catMetric] / catStats[a].count)
  );

  // Hour stats
  const hourStats: Record<number, { total: number; count: number }> = {};
  posts.forEach((p) => {
    const h = Number(p.hour);
    if (!isNaN(h)) {
      if (!hourStats[h]) hourStats[h] = { total: 0, count: 0 };
      hourStats[h].total += p.score;
      hourStats[h].count += 1;
    }
  });

  // Trend last 10 posts sorted by time
  const sorted = [...posts].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const trend = sorted.slice(-10);

  // Top 10 by score in period
  const top10Period = [...periodPosts].sort((a, b) => b.score - a.score).slice(0, 10);

  // Best post of week
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekPosts = posts.filter((p) => new Date(p.time).getTime() > weekAgo);
  const bestWeek = weekPosts.length > 0
    ? weekPosts.reduce((a, b) => a.score > b.score ? a : b)
    : posts[0];

  // Best hour
  const bestHour = Object.entries(hourStats)
    .sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] ?? "—";
  const topCat = cats[0] ?? "—";

  useEffect(() => {
    if (typeof window === "undefined") return;
    let charts: unknown[] = [];

    const load = () => {
      const Chart = (window as unknown as { Chart: unknown }).Chart;
      if (!Chart) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const C = Chart as any;
      C.defaults.color = "#555";
      C.defaults.borderColor = "rgba(255,255,255,0.05)";
      C.defaults.font.family = "'Space Mono', monospace";
      C.defaults.font.size = 10;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const destroy = (ref: React.RefObject<HTMLCanvasElement | null>) => {
        if (ref.current) {
          const existing = C.getChart(ref.current);
          if (existing) existing.destroy();
        }
      };

      // 1. Hour chart
      if (hourRef.current) {
        destroy(hourRef);
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const avgScores = hours.map((h) => {
          const s = hourStats[h];
          return s ? Math.round(s.total / s.count) : 0;
        });
        const maxScore = Math.max(...avgScores, 1);
        charts.push(new C(hourRef.current, {
          type: "bar",
          data: {
            labels: hours.map((h) => h % 3 === 0 ? `${h}:00` : ""),
            datasets: [{
              data: avgScores,
              backgroundColor: avgScores.map((v) =>
                v === maxScore ? "#c8ff00" : "rgba(200,255,0,0.15)"
              ),
              borderRadius: 3,
              borderSkipped: false,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: {
              callbacks: {
                title: (items: unknown[]) => {
                  const idx = (items[0] as { dataIndex: number }).dataIndex;
                  return `${idx}:00`;
                }
              }
            }},
            scales: {
              x: { grid: { display: false }, ticks: { maxRotation: 0 } },
              y: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { callback: (v: number) => v >= 1000 ? (v/1000).toFixed(1)+"K" : v }
              },
            },
          },
        }));
      }

      // 2. Category horizontal bars
      if (catRef.current) {
        destroy(catRef);
        const vals = cats.map((c) => Math.round(catStats[c][catMetric] / catStats[c].count));
        const maxVal = Math.max(...vals, 1);
        charts.push(new C(catRef.current, {
          type: "bar",
          data: {
            labels: cats.map((c) => c.length > 22 ? c.slice(0, 22) + "…" : c),
            datasets: [{
              data: vals,
              backgroundColor: vals.map((v, i) => i === 0 ? COLORS[catMetric] : `${COLORS[catMetric]}44`),
              borderRadius: 3,
              maxBarThickness: 20,
            }],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { callback: (v: number) => v >= 1000 ? (v/1000).toFixed(1)+"K" : v },
                max: Math.ceil(maxVal * 1.15),
              },
              y: { grid: { display: false }, ticks: { font: { size: 10 } } },
            },
          },
        }));
      }

      // 3. Trend last 10
      if (trendRef.current) {
        destroy(trendRef);
        charts.push(new C(trendRef.current, {
          type: "line",
          data: {
            labels: trend.map((_, i) => `#${i + 1}`),
            datasets: [{
              data: trend.map((p) => p.score),
              borderColor: "#c8ff00",
              backgroundColor: "rgba(200,255,0,0.06)",
              borderWidth: 2,
              pointBackgroundColor: "#c8ff00",
              pointRadius: 4,
              tension: 0.4,
              fill: true,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false } },
              y: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { callback: (v: number) => v >= 1000 ? (v/1000).toFixed(1)+"K" : v }
              },
            },
          },
        }));
      }

      // 4. Day/period chart
      if (dayRef.current) {
        destroy(dayRef);
        charts.push(new C(dayRef.current, {
          type: "bar",
          data: {
            labels: dayData.map((d) => d.label),
            datasets: [{
              label: "Просмотры",
              data: dayData.map((d) => d.views),
              backgroundColor: "rgba(200,255,0,0.2)",
              borderColor: "#c8ff00",
              borderWidth: 1,
              borderRadius: 3,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: period === "month" ? 10 : 24 } },
              y: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { callback: (v: number) => v >= 1000 ? (v/1000).toFixed(1)+"K" : v },
              },
            },
          },
        }));
      }
    };

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = load;
    if ((window as unknown as { Chart: unknown }).Chart) { load(); } else { document.head.appendChild(script); }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (charts as any[]).forEach((c) => { try { c.destroy(); } catch {} });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, catMetric, period]);

  if (posts.length === 0) {
    return <div className={styles.empty}>◌<br />Нет данных для анализа</div>;
  }

  return (
    <div className={styles.wrap}>

      {/* Пост недели */}
      {bestWeek && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className={styles.weekBadge}>НЕДЕЛЯ</span>
            Лучший пост
          </div>
          <div className={styles.bestPost}>
            <p className={styles.bestText}>{bestWeek.text.slice(0, 200)}{bestWeek.text.length > 200 ? "…" : ""}</p>
            <div className={styles.bestMeta}>
              <span className={styles.bestStat} style={{ color: "var(--accent)" }}>⚡ {bestWeek.score.toLocaleString()}</span>
              <span className={styles.bestStat}>👁 {bestWeek.views.toLocaleString()}</span>
              <span className={styles.bestStat}>❤️ {bestWeek.likes}</span>
              <span className={styles.bestCat}>{bestWeek.category}</span>
            </div>
          </div>
        </div>
      )}

      {/* Быстрая сводка */}
      <div className={styles.quickRow}>
        <div className={styles.qCard}>
          <div className={styles.qLabel}>Лучший час</div>
          <div className={styles.qValue} style={{ color: "var(--accent)" }}>{bestHour}:00</div>
        </div>
        <div className={styles.qCard}>
          <div className={styles.qLabel}>Топ категория</div>
          <div className={styles.qValue} style={{ color: "var(--purple)", fontSize: "12px" }}>{topCat.slice(0, 18)}</div>
        </div>
        <div className={styles.qCard}>
          <div className={styles.qLabel}>Всего постов</div>
          <div className={styles.qValue} style={{ color: "var(--blue)" }}>{posts.length}</div>
        </div>
      </div>

      {/* Активность по часам */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Активность по часам (avg score)</div>
        <div className={styles.chartWrap} style={{ height: 160 }}>
          <canvas ref={hourRef} role="img" aria-label="Активность по часам суток" />
        </div>
      </div>

      {/* По категориям */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>Топ категории</div>
          <div className={styles.metricTabs}>
            {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
              <button
                key={m}
                className={`${styles.mTab} ${catMetric === m ? styles.mTabActive : ""}`}
                onClick={() => setCatMetric(m)}
                style={catMetric === m ? { borderColor: COLORS[m], color: COLORS[m] } : {}}
              >
                {METRIC_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartWrap} style={{ height: Math.max(cats.length * 34 + 20, 120) }}>
          <canvas ref={catRef} role="img" aria-label="Метрики по категориям" />
        </div>
      </div>

      {/* Просмотры по периоду */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>График просмотров</div>
          <div className={styles.periodTabs}>
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                className={`${styles.mTab} ${period === p ? styles.mTabActive : ""}`}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartWrap} style={{ height: 150 }}>
          <canvas ref={dayRef} role="img" aria-label="Просмотры по дням" />
        </div>
      </div>

      {/* Топ-10 за период */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Топ-10 постов — {PERIOD_LABELS[period]}
          <span className={styles.periodCount}>{periodPosts.length} постов</span>
        </div>
        {top10Period.length === 0 ? (
          <div className={styles.noPosts}>Нет постов за этот период</div>
        ) : (
          <div className={styles.topList}>
            {top10Period.map((p, i) => (
              <div key={i} className={styles.topItem}>
                <span className={styles.topNum} style={{ color: i === 0 ? "var(--accent)" : "var(--text3)" }}>
                  {i + 1}
                </span>
                <div className={styles.topContent}>
                  <p className={styles.topText}>{p.text.slice(0, 120)}{p.text.length > 120 ? "…" : ""}</p>
                  <div className={styles.topMeta}>
                    {p.category && <span className={styles.topCat}>{p.category}</span>}
                    <span className={styles.topStat} style={{ color: "var(--accent)" }}>⚡ {p.score}</span>
                    <span className={styles.topStat}>👁 {p.views}</span>
                    <span className={styles.topStat}>❤️ {p.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Тренд последних 10 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Тренд последних {trend.length} постов (score)</div>
        <div className={styles.chartWrap} style={{ height: 160 }}>
          <canvas ref={trendRef} role="img" aria-label="Тренд score последних постов" />
        </div>
      </div>

    </div>
  );
}
