import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

export type ChartRange = '7D' | '1M' | '3M' | '1Y';

interface HistoryPoint {
  date: string;
  rate: number;
}

interface CurrencyRateChartProps {
  fromCode: string;
  toCode: string;
}

export function CurrencyRateChart({
  fromCode,
  toCode,
}: CurrencyRateChartProps) {
  const [range, setRange] = useState<ChartRange>('1M');
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [provider, setProvider] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHoverIdx(null);
    try {
      const res = await fetch(
        `/api/currency-history?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}&range=${range}`
      );
      const data = await res.json();
      if (!res.ok || !data?.ok || !Array.isArray(data?.points)) {
        throw new Error(data?.error || 'Could not load exchange rate chart');
      }
      setPoints(data.points);
      setProvider(data.provider || '');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load chart data'
      );
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [fromCode, toCode, range]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const width = 320;
  const height = 148;
  const padX = 12;
  const padTop = 16;
  const padBottom = 20;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;

  const rates = points.map((p) => p.rate);
  const minRate = rates.length ? Math.min(...rates) : 0;
  const maxRate = rates.length ? Math.max(...rates) : 1;
  const span = maxRate - minRate || Math.max(maxRate * 0.01, 0.0001);

  const coords = points.map((pt, idx) => {
    const x =
      points.length > 1
        ? padX + (idx / (points.length - 1)) * plotW
        : padX + plotW / 2;
    const y = padTop + (1 - (pt.rate - minRate) / span) * plotH;
    return { x, y, ...pt };
  });

  const linePath =
    coords.length > 0
      ? coords
          .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
          .join(' ')
      : '';

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(
          padTop + plotH
        ).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(
          1
        )} Z`
      : '';

  const firstRate = points[0]?.rate ?? 0;
  const lastRate = points[points.length - 1]?.rate ?? 0;
  const pctChange =
    firstRate > 0 ? ((lastRate - firstRate) / firstRate) * 100 : 0;

  const activePoint =
    hoverIdx !== null && coords[hoverIdx]
      ? coords[hoverIdx]
      : coords[coords.length - 1];

  const formatRate = (r: number) => {
    if (r >= 100) return r.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (r >= 1) return r.toFixed(4);
    return r.toFixed(6);
  };

  return (
    <div className="obsidian-display-screen rounded-[14px] border lux-border-subtle p-3 space-y-2.5">
      {/* Header & Timeframe Selector */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] lux-text-muted">
            {fromCode} / {toCode} Trend
          </div>
          {activePoint && !loading && !error && (
            <div className="flex items-baseline gap-2">
              <span className="text-[14px] font-bold font-mono tabular-nums lux-text-bright">
                {formatRate(activePoint.rate)}
              </span>
              <span
                className={`text-[11px] font-mono tabular-nums ${
                  pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {pctChange >= 0 ? '+' : ''}
                {pctChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[#121316] p-0.5 rounded-[9px] border lux-border-subtle shrink-0">
          {(['7D', '1M', '3M', '1Y'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`min-h-[30px] px-2 rounded-[7px] text-[11px] font-semibold cursor-pointer transition-colors ${
                range === r ? 'btn-gold-key' : 'lux-text-muted hover:lux-text-bright'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      {loading ? (
        <div className="h-[148px] flex items-center justify-center text-[12px] lux-text-muted font-mono">
          Loading {range} rate history...
        </div>
      ) : error ? (
        <div className="h-[148px] flex flex-col items-center justify-center gap-2 text-center px-3">
          <p className="text-[12px] lux-text-muted">{error}</p>
          <button
            type="button"
            onClick={loadHistory}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg btn-obsidian-key text-[11px] cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : coords.length > 0 ? (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-[148px] overflow-visible select-none touch-none"
            onMouseLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id="luxChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--lux-accent-bright)"
                  stopOpacity="0.34"
                />
                <stop
                  offset="100%"
                  stopColor="var(--lux-accent-bright)"
                  stopOpacity="0.02"
                />
              </linearGradient>
            </defs>

            {/* Horizontal subtle reference lines */}
            {[0, 0.5, 1].map((t) => {
              const y = padTop + t * plotH;
              return (
                <line
                  key={t}
                  x1={padX}
                  x2={width - padX}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Area & Line */}
            <path d={areaPath} fill="url(#luxChartFill)" />
            <path
              d={linePath}
              fill="none"
              stroke="var(--lux-accent-bright)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active / Hovered Point Indicator */}
            {activePoint && (
              <>
                <line
                  x1={activePoint.x}
                  x2={activePoint.x}
                  y1={padTop}
                  y2={padTop + plotH}
                  stroke="var(--lux-border-strong)"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="4"
                  fill="var(--lux-accent-bright)"
                  stroke="#111215"
                  strokeWidth="1.8"
                />
              </>
            )}

            {/* Invisible interactive hit columns */}
            {coords.map((c, idx) => {
              const colW = plotW / Math.max(coords.length, 1);
              return (
                <rect
                  key={c.date + idx}
                  x={c.x - colW / 2}
                  y={padTop}
                  width={colW}
                  height={plotH}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIdx(idx)}
                  onClick={() => setHoverIdx(idx)}
                />
              );
            })}

            {/* Min / Max / Date labels */}
            <text
              x={padX}
              y={height - 4}
              fill="var(--lux-muted)"
              fontSize="9.5"
              fontFamily="var(--font-mono)"
            >
              {points[0]?.date}
            </text>
            <text
              x={width - padX}
              y={height - 4}
              textAnchor="end"
              fill="var(--lux-muted)"
              fontSize="9.5"
              fontFamily="var(--font-mono)"
            >
              {activePoint?.date}
            </text>
          </svg>

          <div className="flex items-center justify-between text-[10px] font-mono tabular-nums lux-text-muted pt-1 border-t lux-border-subtle">
            <span>Low: {formatRate(minRate)}</span>
            <span>High: {formatRate(maxRate)}</span>
            {provider && <span>{provider}</span>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
