import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

interface CachedRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
  fetchedAt: number;
  provider: string;
}

let ratesCache: CachedRates | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

async function fetchLiveRates(): Promise<CachedRates> {
  const now = Date.now();
  if (ratesCache && now - ratesCache.fetchedAt < CACHE_TTL_MS) {
    return ratesCache;
  }

  // Primary provider: open.er-api.com (no key required, 160+ currencies)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.result === 'success' && data?.rates) {
        ratesCache = {
          base: 'USD',
          rates: data.rates,
          updatedAt: data.time_last_update_utc || new Date().toISOString(),
          fetchedAt: now,
          provider: 'open.er-api.com',
        };
        return ratesCache;
      }
    }
  } catch {
    // Fall through to secondary provider
  }

  // Secondary provider: api.frankfurter.app
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://api.frankfurter.app/latest?from=USD', {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.rates) {
        ratesCache = {
          base: 'USD',
          rates: { USD: 1, ...data.rates },
          updatedAt: data.date ? `${data.date}T00:00:00Z` : new Date().toISOString(),
          fetchedAt: now,
          provider: 'frankfurter.app',
        };
        return ratesCache;
      }
    }
  } catch {
    // Fall through to cached or error
  }

  if (ratesCache) {
    return ratesCache;
  }

  throw new Error('Unable to reach live exchange rate providers.');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/currency-rates', async (req, res) => {
    const force = req.query.refresh === '1';
    if (force) {
      ratesCache = null;
    }
    try {
      const data = await fetchLiveRates();
      res.json({
        ok: true,
        base: data.base,
        rates: data.rates,
        updatedAt: data.updatedAt,
        provider: data.provider,
      });
    } catch (err) {
      res.status(502).json({
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to load live currency rates',
      });
    }
  });

  interface HistoryPoint {
    date: string;
    rate: number;
  }

  interface HistoryCacheEntry {
    points: HistoryPoint[];
    provider: string;
    fetchedAt: number;
  }

  const historyCache = new Map<string, HistoryCacheEntry>();
  const HISTORY_TTL_MS = 30 * 60 * 1000;

  function formatIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  app.get('/api/currency-history', async (req, res) => {
    const from = String(req.query.from || 'USD').toUpperCase().replace(/[^A-Z]/g, '');
    const to = String(req.query.to || 'EUR').toUpperCase().replace(/[^A-Z]/g, '');
    const range = String(req.query.range || '1M').toUpperCase();

    if (!from || !to || from.length !== 3 || to.length !== 3) {
      res.status(400).json({ ok: false, error: 'Invalid currency codes' });
      return;
    }

    if (from === to) {
      const today = formatIsoDate(new Date());
      res.json({
        ok: true,
        from,
        to,
        range,
        provider: 'identity',
        points: [
          { date: today, rate: 1 },
          { date: today, rate: 1 },
        ],
      });
      return;
    }

    const cacheKey = `${from}_${to}_${range}`;
    const cached = historyCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < HISTORY_TTL_MS) {
      res.json({
        ok: true,
        from,
        to,
        range,
        provider: cached.provider,
        points: cached.points,
      });
      return;
    }

    const daysMap: Record<string, number> = {
      '7D': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365,
    };
    const days = daysMap[range] ?? 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 86400 * 1000);
    const startStr = formatIsoDate(startDate);
    const endStr = formatIsoDate(endDate);

    // 1. Primary: Frankfurter time-series (fast single request for major ECB currencies)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const url = `https://api.frankfurter.app/${startStr}..${endStr}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const apiRes = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data?.rates && typeof data.rates === 'object') {
          const points: HistoryPoint[] = Object.entries(
            data.rates as Record<string, Record<string, number>>
          )
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, obj]) => ({ date, rate: obj[to] }))
            .filter((p) => typeof p.rate === 'number' && Number.isFinite(p.rate));

          if (points.length >= 2) {
            historyCache.set(cacheKey, {
              points,
              provider: 'frankfurter.app',
              fetchedAt: Date.now(),
            });
            res.json({
              ok: true,
              from,
              to,
              range,
              provider: 'frankfurter.app',
              points,
            });
            return;
          }
        }
      }
    } catch {
      // Fall through to sampled currency-api for non-ECB currencies
    }

    // 2. Fallback for all 160+ world currencies: sampled daily snapshots via jsDelivr currency-api
    try {
      const sampleCount = range === '7D' ? 8 : 12;
      const sampleDates: string[] = [];
      for (let i = 0; i < sampleCount; i++) {
        const ratio = i / (sampleCount - 1);
        const dt = new Date(
          startDate.getTime() + ratio * (endDate.getTime() - startDate.getTime())
        );
        sampleDates.push(i === sampleCount - 1 ? 'latest' : formatIsoDate(dt));
      }

      const fromLower = from.toLowerCase();
      const toLower = to.toLowerCase();

      const results = await Promise.allSettled(
        sampleDates.map(async (dateTag) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateTag}/v1/currencies/usd.json`;
          const r = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          if (!r.ok) throw new Error('Snapshot unavailable');
          const json = await r.json();
          const usdMap = json?.usd as Record<string, number> | undefined;
          const dateVal: string = json?.date || (dateTag === 'latest' ? endStr : dateTag);
          if (!usdMap || !usdMap[fromLower] || !usdMap[toLower]) {
            throw new Error('Pair missing');
          }
          return {
            date: dateVal,
            rate: usdMap[toLower] / usdMap[fromLower],
          };
        })
      );

      const seen = new Set<string>();
      const points: HistoryPoint[] = results
        .filter((r): r is PromiseFulfilledResult<HistoryPoint> => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter((p) => Number.isFinite(p.rate))
        .sort((a, b) => a.date.localeCompare(b.date))
        .filter((p) => {
          if (seen.has(p.date)) return false;
          seen.add(p.date);
          return true;
        });

      if (points.length >= 2) {
        historyCache.set(cacheKey, {
          points,
          provider: 'currency-api',
          fetchedAt: Date.now(),
        });
        res.json({
          ok: true,
          from,
          to,
          range,
          provider: 'currency-api',
          points,
        });
        return;
      }
    } catch {
      // Fall through to error
    }

    res.status(502).json({
      ok: false,
      error: `Historical rate data unavailable for ${from}/${to}`,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lux Calc server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
