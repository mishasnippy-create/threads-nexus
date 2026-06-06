'use client';
import { useState } from 'react';
import { Post, SortMetric } from '@/lib/types';
import { fmt, getCategoryStats, getHourStats } from '@/lib/utils';
import styles from './Analytics.module.css';

interface Props { posts: Post[]; }

const METRIC_LABELS: Record<SortMetric, string> = {
  views: 'Просмотры',
  likes: 'Лайки',
  reposts: 'Репосты',
  score: 'Score',
};

const METRIC_COLORS: Record<SortMetric, string> = {
  views: 'var(--green)',
  likes: 'var(--violet)',
  reposts: 'var(--blue)',
  score: 'var(--green)',
};

export default function Analytics({ posts }: Props) {
  const [activeMetric, setActiveMetric] = useState<SortMetric>('score');

  const catStats = getCategoryStats(posts);
  const hourStats = getHourStats(posts);

  const maxCat = Math.max(...catStats.map((c) => c[activeMetric]), 1);
  const maxHour = Math.max(...hourStats.map((h) => h.avgScore), 1);

  // Last 7 posts trend
  const last7 = [...posts].slice(0, 7).reverse();
  const maxTrend = Math.max(...last7.map((p) => p.score), 1);

  return (
    <div className={styles.wrap}>

      {/* Chart 1: Categories bar chart */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className={styles.title}>По категориям</h3>
          <div className={styles.metricPicker}>
            {(Object.keys(METRIC_LABELS) as SortMetric[]).map((m) => (
              <button
                key={m}
                className={`${styles.mBtn} ${activeMetric === m ? styles.mActive : ''}`}
                style={activeMetric === m ? { borderColor: METRIC_COLORS[m], color: METRIC_COLORS[m] } : {}}
                onClick={() => setActiveMetric(m)}
              >
                {METRIC_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.catChart}>
          {catStats.sort((a, b) => b[activeMetric] - a[activeMetric]).map((c) => {
            const pct = Math.round((c[activeMetric] / maxCat) * 100);
            return (
              <div key={c.cat} className={styles.catRow}>
                <span className={styles.catLabel}>{c.cat}</span>
                <div className={styles.catBarWrap}>
                  <div
                    className={styles.catBar}
                    style={{ width: `${pct}%`, background: METRIC_COLORS[activeMetric] }}
                  />
                </div>
                <span className={styles.catVal} style={{ color: METRIC_COLORS[activeMetric] }}>
                  {fmt(c[activeMetric])}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chart 2: Multi-metric by category */}
      <section className={styles.section}>
        <h3 className={styles.title}>Все метрики</h3>
        <div className={styles.legend}>
          {(Object.keys(METRIC_LABELS) as SortMetric[]).map((m) => (
            <span key={m} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: METRIC_COLORS[m] }} />
              {METRIC_LABELS[m]}
            </span>
          ))}
        </div>
        <div className={styles.multiChart}>
          {catStats.map((c) => {
            const maxAll = Math.max(c.views, c.likes, c.reposts, c.score, 1);
            return (
              <div key={c.cat} className={styles.multiCol}>
                <div className={styles.multiBars}>
                  {(['views', 'likes', 'reposts', 'score'] as SortMetric[]).map((m) => (
                    <div
                      key={m}
                      className={styles.multiBar}
                      style={{
                        height: `${Math.round((c[m] / maxAll) * 80)}px`,
                        background: METRIC_COLORS[m],
                      }}
                      title={`${METRIC_LABELS[m]}: ${fmt(c[m])}`}
                    />
                  ))}
                </div>
                <span className={styles.multiLabel}>{c.cat.slice(0, 8)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chart 3: Hour activity */}
      {hourStats.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.title}>Активность по часам</h3>
          <p className={styles.subtitle}>Средний score по времени публикации</p>
          <div className={styles.hourChart}>
            {hourStats.map(({ hour, avgScore }) => {
              const pct = Math.round((avgScore / maxHour) * 100);
              const isTop = avgScore === maxHour;
              return (
                <div key={hour} className={styles.hourCol}>
                  <div className={styles.hourBarWrap}>
                    <div
                      className={`${styles.hourBar} ${isTop ? styles.hourBarTop : ''}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <span className={`${styles.hourLabel} ${isTop ? styles.hourLabelTop : ''}`}>
                    {hour}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Trend last 7 posts */}
      {last7.length > 1 && (
        <section className={styles.section}>
          <h3 className={styles.title}>Тренд последних {last7.length} постов</h3>
          <div className={styles.trendChart}>
            <svg viewBox={`0 0 ${last7.length * 40} 60`} className={styles.trendSvg} preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C8FF00" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8FF00" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const pts = last7.map((p, i) => ({
                  x: i * 40 + 20,
                  y: 55 - Math.round((p.score / maxTrend) * 50),
                }));
                const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const fillPath = `${path} L ${pts[pts.length-1].x} 60 L ${pts[0].x} 60 Z`;
                return (
                  <>
                    <path d={fillPath} fill="url(#trendFill)" />
                    <path d={path} stroke="url(#trendGrad)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3" fill={i === last7.length - 1 ? '#C8FF00' : '#A78BFA'} />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </section>
      )}

      {/* Category table */}
      <section className={styles.section}>
        <h3 className={styles.title}>Сводка по категориям</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Категория</th>
                <th>Постов</th>
                <th>Avg Views</th>
                <th>Avg Likes</th>
                <th>Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {catStats.sort((a,b) => b.score - a.score).map((c) => (
                <tr key={c.cat}>
                  <td>
                    <span className={styles.catTag}>{c.cat}</span>
                  </td>
                  <td>{c.count}</td>
                  <td style={{ color: 'var(--green)' }}>{fmt(c.views)}</td>
                  <td style={{ color: 'var(--violet)' }}>{fmt(c.likes)}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(c.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
