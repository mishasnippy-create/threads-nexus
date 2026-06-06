"use client";
import { useEffect, useRef, useState } from "react";
import { Post } from "@/lib/types";
import styles from "./Analytics.module.css";

interface Props { posts: Post[]; }

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

export default function Analytics({ posts }: Props) {
  const byHourRef = useRef<HTMLCanvasElement>(null);
  const byCatRef = useRef<HTMLCanvasElement>(null);
  const trendRef = useRef<HTMLCanvasElement>(null);
  const multiRef = useRef<HTMLCanvasElement>(null);
  const [metric, setMetric] = useState<Metric>("views");

  // Category stats
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
  const cats = Object.keys(catStats);

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

  // Trend — last 10 posts by time
  const sorted = [...posts].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const trend = sorted.slice(-10);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let charts: any[] = [];

    const load = () => {
      const Chart = (window as any).Chart;
      if (!Chart) return;

      Chart.defaults.color = "#666";
      Chart.defaults.borderColor = "rgba(255,255,255,0.06)";
      Chart.defaults.font.family = "'Space Mono', monospace";
      Chart.defaults.font.size = 10;

      const destroy = (ref: React.RefObject<HTMLCanvasElement>) => {
        const existing = (Chart as any).getChart(ref.current!);
        if (existing) existing.destroy();
      };

      // 1. By hour
      if (byHourRef.current) {
        destroy(byHourRef);
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const avgScores = hours.map((h) => {
          const s = hourStats[h];
          return s ? Math.round(s.total / s.count) : 0;
        });
        charts.push(new Chart(byHourRef.current, {
          type: "bar",
          data: {
            labels: hours.map((h) => `${h}:00`),
            datasets: [{
              data: avgScores,
              backgroundColor: hours.map((h) => avgScores[h] === Math.max(...avgScores) ? "#c8ff00" : "rgba(200,255,0,0.2)"),
              borderRadius: 4,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
              y: { ticks: { callback: (v: number) => v >= 1000 ? (v/1000).toFixed(1)+"K" : v } },
            },
          },
        }));
      }

      // 2. By category (selected metric)
      if (byCatRef.current) {
        destroy(byCatRef);
        const vals = cats.map((c) => Math.round(catStats[c][metric] / catStats[c].count));
        const maxVal = Math.max(...vals, 1);
        charts.push(new Chart(byCatRef.current, {
          type: "bar",
          data: {
            labels: cats.map((c) => c.length > 18 ? c.slice(0, 18) + "…" : c),
            datasets: [{
              data: vals,
              backgroundColor: vals.map((v) => v === maxVal ? COLORS[metric] : `${COLORS[metric]}33`),
              borderRadius: 4,
            }],
          },
          options: {
            indexAxis: "y",
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { callback: (v: number) => v >= 1000 ? (v/1000).toFixed(1)+"K" : v } },
              y: { ticks: { font: { size: 9 } } },
            },
          },
        }));
      }

      // 3. Trend — last 10
      if (trendRef.current) {
        destroy(trendRef);
        charts.push(new Chart(trendRef.current, {
          type: "line",
          data: {
            labels: trend.map((_, i) => `#${i + 1}`),
            datasets: [{
              data: trend.map((p) => p.score),
              borderColor: "#c8ff00",
              backgroundColor: "rgba(200,255,0,0.08)",
              borderWidth: 2,
              pointBackgroundColor: "#c8ff00",
              pointRadius: 4,
              tension: 0.4,
              fill: true,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { ticks: { callback: (v: number) => v >= 1000 ? (v/1000).toFixed(1)+"K" : v } } },
          },
        }));
      }

      // 4. Multi-line по категориям
      if (multiRef.current) {
        destroy(multiRef);
        const metrics: Metric[] = ["views", "likes", "reposts", "score"];
        charts.push(new Chart(multiRef.current, {
          type: "line",
          data: {
            labels: cats.map((c) => c.length > 14 ? c.slice(0, 14) + "…" : c),
            datasets: metrics.map((m) => ({
              label: METRIC_LABELS[m],
              data: cats.map((c) => Math.round(catStats[c][m] / catStats[c].count)),
              borderColor: COLORS[m],
              backgroundColor: "transparent",
              borderWidth: 2,
              pointBackgroundColor: COLORS[m],
              pointRadius: 3,
              tension: 0.3,
            })),
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: { ticks: { font: { size: 9 } } },
              y: { ticks: { callback: (v: number) => v >= 1000 ? (v/1000).toFixed(1)+"K" : v } },
            },
          },
        }));
      }
    };

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = load;
    if ((window as any).Chart) { load(); } else { document.head.appendChild(script); }

    return () => { charts.forEach((c) => { try { c.destroy(); } catch {} }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, metric]);

  if (posts.length === 0) {
    return <div className={styles.empty}>◌<br />Нет данных для анализа</div>;
  }

  // Best post of week
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekPosts = posts.filter((p) => new Date(p.time).getTime() > weekAgo);
  const bestWeek = weekPosts.length > 0
    ? weekPosts.reduce((a, b) => a.score > b.score ? a : b)
    : posts[0];

  const avgER = posts.filter((p) => p.views > 0).reduce((s, p) => s + (p.likes / p.views) * 100, 0) / Math.max(posts.filter((p) => p.views > 0).length, 1);

  return (
    <div className={styles.wrap}>

      {/* Пост недели */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>🏆 Пост недели</div>
        <div className={styles.bestPost}>
          <p className={styles.bestText}>{bestWeek.text.slice(0, 200)}{bestWeek.text.length > 200 ? "…" : ""}</p>
          <div className={styles.bestMeta}>
            <span className={styles.bestStat} style={{ color: "var(--green)" }}>★ {bestWeek.score.toLocaleString()}</span>
            <span className={styles.bestStat}>◎ {bestWeek.views.toLocaleString()}</span>
            <span className={styles.bestStat}>♥ {bestWeek.likes}</span>
            <span className={styles.bestCat}>{bestWeek.category}</span>
          </div>
        </div>
      </div>

      {/* Сводка ER */}
      <div className={styles.erRow}>
        <div className={styles.erCard}>
          <div className={styles.erLabel}>Ср. вовлечённость</div>
          <div className={styles.erValue} style={{ color: "var(--purple)" }}>{avgER.toFixed(2)}%</div>
        </div>
        <div className={styles.erCard}>
          <div className={styles.erLabel}>Лучший час</div>
          <div className={styles.erValue} style={{ color: "var(--green)" }}>
            {Object.entries(hourStats).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0] ?? "—"}:00
          </div>
        </div>
        <div className={styles.erCard}>
          <div className={styles.erLabel}>Топ категория</div>
          <div className={styles.erValue} style={{ color: "var(--blue)", fontSize: "13px" }}>
            {cats.sort((a, b) => (catStats[b].score / catStats[b].count) - (catStats[a].score / catStats[a].count))[0]?.slice(0, 16) ?? "—"}
          </div>
        </div>
      </div>

      {/* График по часам */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Активность по часам (avg score)</div>
        <div className={styles.chartWrap} style={{ height: 200 }}>
          <canvas ref={byHourRef} role="img" aria-label="Активность по часам суток" />
        </div>
      </div>

      {/* График по категориям */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>По категориям</div>
        <div className={styles.metricTabs}>
          {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
            <button key={m} className={`${styles.mTab} ${metric === m ? styles.mTabActive : ""}`} onClick={() => setMetric(m)}>
              {METRIC_LABELS[m]}
            </button>
          ))}
        </div>
        <div className={styles.chartWrap} style={{ height: Math.max(cats.length * 36 + 40, 160) }}>
          <canvas ref={byCatRef} role="img" aria-label="Метрики по категориям" />
        </div>
      </div>

      {/* Все метрики */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Все метрики по категориям</div>
        <div className={styles.legend}>
          {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
            <span key={m} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: COLORS[m] }} />
              {METRIC_LABELS[m]}
            </span>
          ))}
        </div>
        <div className={styles.chartWrap} style={{ height: 220 }}>
          <canvas ref={multiRef} role="img" aria-label="Все метрики по категориям" />
        </div>
      </div>

      {/* Тренд */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Тренд последних {trend.length} постов (score)</div>
        <div className={styles.chartWrap} style={{ height: 180 }}>
          <canvas ref={trendRef} role="img" aria-label="Тренд score последних постов" />
        </div>
      </div>

    </div>
  );
}
