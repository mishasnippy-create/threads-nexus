# Threads Nexus Dashboard

Live system dashboard for your Threads autopublishing pipeline.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **CSS Modules** (zero dependencies beyond Next.js)

## Setup

```bash
# Install
npm install

# Run dev server
npm run dev
# → http://localhost:3000

# Build for production
npm run build
npm start
```

## Deploy to Vercel

```bash
npx vercel
```

Or push to GitHub and connect at vercel.com — zero config needed.

## Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout + fonts
│   ├── globals.css      # Design tokens (CSS vars)
│   ├── page.tsx         # Dashboard page (data fetching, state)
│   └── page.module.css
├── components/
│   ├── Header.tsx        # Sticky header with status + refresh
│   ├── StatsGrid.tsx     # 5-card metrics row
│   ├── FilterBar.tsx     # Category filter buttons
│   └── PostCard.tsx      # Individual post with score bar
└── lib/
    ├── types.ts          # Post, Stats interfaces
    └── utils.ts          # API URL, fmt(), timeAgo()
```

## API

The dashboard connects to your Google Apps Script endpoint.
Update `API_URL` in `src/lib/utils.ts` if the URL changes.

Expected response: **array of post objects** — `Array.isArray()` checked.
Also handles wrapped format: `{ posts: [...] }`.

## Features

- Auto-refresh every 45 seconds with countdown
- Client-side aggregation (views / likes / reposts / score / posts)
- Sorted by score descending
- Filter by category (dynamic from data)
- TOP badge on highest-scoring post
- Score bar (relative to max)
- Error display with raw API response on parse failure
- Sticky header with live status indicator
