import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  X,
} from 'lucide-react';
import {
  AngleMode,
  compileMathFunction,
  formatDisplayNumber,
  formatExpressionWithCommas,
} from '../utils/mathEngine';

interface ScientificGrapherProps {
  angleMode: AngleMode;
  initialExpression?: string;
  onDisplaySync: (expression: string, result: string) => void;
}

interface Viewport {
  centerX: number;
  centerY: number;
  scale: number; // pixels per math unit
}

const DEFAULT_VIEWPORT: Viewport = {
  centerX: 0,
  centerY: 0,
  scale: 24,
};

function computeNiceStep(pixelsPerUnit: number): number {
  const targetPx = 44;
  const rawStep = targetPx / pixelsPerUnit;
  const pow10 = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / pow10;
  if (norm < 1.5) return 1 * pow10;
  if (norm < 3.5) return 2 * pow10;
  if (norm < 7.5) return 5 * pow10;
  return 10 * pow10;
}

function formatTickLabel(val: number): string {
  if (Math.abs(val) < 1e-10) return '0';
  const rounded = Number(val.toPrecision(6));
  return formatExpressionWithCommas(String(rounded));
}

export function ScientificGrapher({
  angleMode,
  initialExpression,
  onDisplaySync,
}: ScientificGrapherProps) {
  const [fxExpr, setFxExpr] = useState<string>(() => {
    if (initialExpression && /[xX]/.test(initialExpression)) {
      return initialExpression;
    }
    return 'sin(x)';
  });
  const [gxExpr, setGxExpr] = useState<string>('');
  const [showGx, setShowGx] = useState<boolean>(false);
  const [activeInput, setActiveInput] = useState<'fx' | 'gx'>('fx');

  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
  const [traceX, setTraceX] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origCenterX: number;
    origCenterY: number;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    origCenterX: 0,
    origCenterY: 0,
    moved: false,
  });

  const compiledFx = useMemo(
    () => compileMathFunction(fxExpr, angleMode),
    [fxExpr, angleMode]
  );
  const compiledGx = useMemo(
    () =>
      showGx && gxExpr.trim()
        ? compileMathFunction(gxExpr, angleMode)
        : { fn: null, error: null },
    [showGx, gxExpr, angleMode]
  );

  const traceY = useMemo(() => {
    if (traceX === null || !compiledFx.fn) return null;
    const y = compiledFx.fn(traceX);
    return Number.isFinite(y) ? y : null;
  }, [traceX, compiledFx]);

  const traceGy = useMemo(() => {
    if (traceX === null || !compiledGx.fn) return null;
    const y = compiledGx.fn(traceX);
    return Number.isFinite(y) ? y : null;
  }, [traceX, compiledGx]);

  // Sync top OLED display with active expression or traced point
  useEffect(() => {
    if (traceX !== null && traceY !== null) {
      const xStr = formatDisplayNumber(Number(traceX.toFixed(3)));
      const yStr = formatExpressionWithCommas(
        formatDisplayNumber(Number(traceY.toFixed(4)))
      );
      onDisplaySync(`f(${xStr})`, yStr);
    } else if (compiledFx.error) {
      onDisplaySync(`f(x) = ${fxExpr}`, 'Syntax');
    } else {
      onDisplaySync(`f(x) = ${fxExpr || '0'}`, `${angleMode} Plot`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fxExpr, angleMode, traceX, traceY, compiledFx.error]);

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Resolve CSS variables from computed style so theme colors always match
    const styles = getComputedStyle(canvas);
    const accentBright =
      styles.getPropertyValue('--lux-accent-bright').trim() || '#ffd52e';
    const mutedColor =
      styles.getPropertyValue('--lux-muted').trim() || '#b99a3c';

    // Dark obsidian coordinate background
    ctx.fillStyle = '#0f1014';
    ctx.fillRect(0, 0, w, h);

    const toScreenX = (mathX: number) =>
      w / 2 + (mathX - viewport.centerX) * viewport.scale;
    const toScreenY = (mathY: number) =>
      h / 2 - (mathY - viewport.centerY) * viewport.scale;
    const toMathX = (sx: number) =>
      viewport.centerX + (sx - w / 2) / viewport.scale;
    const toMathY = (sy: number) =>
      viewport.centerY - (sy - h / 2) / viewport.scale;

    const minX = toMathX(0);
    const maxX = toMathX(w);
    const minY = toMathY(h);
    const maxY = toMathY(0);

    const majorStep = computeNiceStep(viewport.scale);
    const minorStep = majorStep / 5;

    // Minor Gridlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startMinorX = Math.floor(minX / minorStep) * minorStep;
    for (let x = startMinorX; x <= maxX; x += minorStep) {
      const sx = toScreenX(x);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }
    const startMinorY = Math.floor(minY / minorStep) * minorStep;
    for (let y = startMinorY; y <= maxY; y += minorStep) {
      const sy = toScreenY(y);
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }
    ctx.stroke();

    // Major Gridlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startMajorX = Math.floor(minX / majorStep) * majorStep;
    for (let x = startMajorX; x <= maxX; x += majorStep) {
      const sx = toScreenX(x);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }
    const startMajorY = Math.floor(minY / majorStep) * majorStep;
    for (let y = startMajorY; y <= maxY; y += majorStep) {
      const sy = toScreenY(y);
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }
    ctx.stroke();

    // Primary Axes (X = 0, Y = 0)
    const originX = toScreenX(0);
    const originY = toScreenY(0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (originX >= 0 && originX <= w) {
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, h);
    }
    if (originY >= 0 && originY <= h) {
      ctx.moveTo(0, originY);
      ctx.lineTo(w, originY);
    }
    ctx.stroke();

    // Axis Numeric Tick Labels
    ctx.fillStyle = mutedColor;
    ctx.font = '10px "JetBrains Mono", monospace';
    const axisYClamp = Math.min(Math.max(originY, 12), h - 14);
    const axisXClamp = Math.min(Math.max(originX, 24), w - 24);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = startMajorX; x <= maxX; x += majorStep) {
      if (Math.abs(x) < majorStep * 0.01) continue;
      const sx = toScreenX(x);
      if (sx < 14 || sx > w - 14) continue;
      ctx.fillText(formatTickLabel(x), sx, axisYClamp + 3);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = startMajorY; y <= maxY; y += majorStep) {
      if (Math.abs(y) < majorStep * 0.01) continue;
      const sy = toScreenY(y);
      if (sy < 10 || sy > h - 10) continue;
      ctx.fillText(formatTickLabel(y), axisXClamp - 4, sy);
    }

    // Origin label
    if (originX >= 10 && originX <= w - 10 && originY >= 10 && originY <= h - 12) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('0', originX - 4, originY + 3);
    }

    // Plot curve helper with asymptote discontinuity breaking
    const plotCurve = (
      fn: (x: number) => number,
      strokeColor: string,
      glowColor: string
    ) => {
      const samples = Math.max(320, Math.round(w * 1.5));
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      let penDown = false;
      let prevSy: number | null = null;

      for (let i = 0; i <= samples; i++) {
        const sx = (i / samples) * w;
        const mx = toMathX(sx);
        const my = fn(mx);

        if (!Number.isFinite(my)) {
          penDown = false;
          prevSy = null;
          continue;
        }

        const sy = toScreenY(my);
        // Break stroke across steep vertical asymptotes (e.g., 1/x or tan(x))
        if (prevSy !== null && Math.abs(sy - prevSy) > h * 0.85) {
          penDown = false;
        }

        // Clamp absurd offscreen coordinates slightly outside bounds so canvas remains crisp
        const clampedSy = Math.max(-h * 2, Math.min(h * 3, sy));

        if (!penDown) {
          ctx.moveTo(sx, clampedSy);
          penDown = true;
        } else {
          ctx.lineTo(sx, clampedSy);
        }
        prevSy = sy;
      }
      ctx.stroke();
      ctx.restore();
    };

    if (compiledGx.fn) {
      plotCurve(compiledGx.fn, '#38bdf8', 'rgba(56, 189, 248, 0.35)');
    }
    if (compiledFx.fn) {
      plotCurve(compiledFx.fn, accentBright, accentBright);
    }

    // Trace crosshair & marker dots
    if (traceX !== null) {
      const sx = toScreenX(traceX);
      if (sx >= 0 && sx <= w) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, h);
        ctx.stroke();
        ctx.setLineDash([]);

        if (traceGy !== null) {
          const gy = toScreenY(traceGy);
          if (gy >= -10 && gy <= h + 10) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(sx, gy, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0f1014';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        if (traceY !== null) {
          const sy = toScreenY(traceY);
          if (sy >= -10 && sy <= h + 10) {
            ctx.fillStyle = accentBright;
            ctx.beginPath();
            ctx.arc(sx, sy, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0f1014';
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
        }
      }
    }

    ctx.restore();
  }, [viewport, compiledFx.fn, compiledGx.fn, traceX, traceY, traceGy]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  useEffect(() => {
    const onResize = () => drawGraph();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawGraph]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origCenterX: viewport.centerX,
      origCenterY: viewport.centerY,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }
      setViewport((prev) => ({
        ...prev,
        centerX: dragRef.current.origCenterX - dx / prev.scale,
        centerY: dragRef.current.origCenterY + dy / prev.scale,
      }));
    } else {
      const localX = e.clientX - rect.left;
      const mathX =
        viewport.centerX + (localX - rect.width / 2) / viewport.scale;
      setTraceX(mathX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.moved) {
      const rect = e.currentTarget.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const mathX =
        viewport.centerX + (localX - rect.width / 2) / viewport.scale;
      setTraceX(mathX);
    }
    dragRef.current.active = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(240, Math.max(4, prev.scale * factor)),
    }));
  };

  const zoomBy = (factor: number) => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(240, Math.max(4, prev.scale * factor)),
    }));
  };

  const insertToken = (token: string) => {
    if (activeInput === 'gx' && showGx) {
      setGxExpr((prev) => prev + token);
    } else {
      setFxExpr((prev) => prev + token);
    }
  };

  const quickChips = ['x', '^', '²', '(', ')', 'sin(', 'cos(', '√(', 'π'];
  const presets = [
    { label: 'sin(x)', expr: 'sin(x)' },
    { label: 'x² - 4', expr: 'x^2 - 4' },
    { label: '0.2x³ - x', expr: '0.2x^3 - x' },
    { label: '1/x', expr: '1/x' },
    { label: 'abs(x)-2', expr: 'abs(x) - 2' },
  ];

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-3.5 space-y-2.5">
      {/* f(x) Expression Row */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 min-h-[40px] rounded-[10px] btn-obsidian-key text-[12px] font-bold font-mono flex items-center justify-center shrink-0">
            f(x) =
          </span>
          <input
            type="text"
            value={fxExpr}
            onFocus={() => setActiveInput('fx')}
            onChange={(e) => setFxExpr(e.target.value)}
            placeholder="e.g. sin(x) or x^2 - 4"
            aria-label="Primary function f of x"
            className="w-full min-h-[40px] lux-input rounded-[10px] px-3 py-1.5 font-mono text-[13px]"
          />
          {!showGx && (
            <button
              type="button"
              onClick={() => {
                setShowGx(true);
                setGxExpr((prev) => prev || '0.5x');
                setActiveInput('gx');
              }}
              className="min-h-[40px] px-2.5 rounded-[10px] btn-obsidian-key text-[11px] font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
              title="Compare a second function g(x)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>g(x)</span>
            </button>
          )}
        </div>

        {showGx && (
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 min-h-[40px] rounded-[10px] bg-[#131d26] border border-sky-400/40 text-sky-400 text-[12px] font-bold font-mono flex items-center justify-center shrink-0">
              g(x) =
            </span>
            <input
              type="text"
              value={gxExpr}
              onFocus={() => setActiveInput('gx')}
              onChange={(e) => setGxExpr(e.target.value)}
              placeholder="e.g. cos(x) or 0.5x"
              aria-label="Secondary function g of x"
              className="w-full min-h-[40px] lux-input rounded-[10px] px-3 py-1.5 font-mono text-[13px]"
            />
            <button
              type="button"
              onClick={() => {
                setShowGx(false);
                setActiveInput('fx');
              }}
              aria-label="Remove secondary function g(x)"
              className="min-h-[40px] min-w-[40px] rounded-[10px] btn-obsidian-key flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {compiledFx.error && (
          <p className="text-[11px] text-amber-400 font-mono px-1">
            f(x): {compiledFx.error}
          </p>
        )}
        {showGx && compiledGx.error && (
          <p className="text-[11px] text-sky-300 font-mono px-1">
            g(x): {compiledGx.error}
          </p>
        )}
      </div>

      {/* Quick Symbol Insert Bar */}
      <div className="flex items-center gap-1 overflow-x-auto gold-scroll pb-0.5">
        {quickChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => insertToken(chip)}
            className="min-h-[34px] min-w-[34px] px-2 rounded-[8px] btn-gold-key text-[12px] font-bold font-mono shrink-0 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Coordinate Plane Canvas */}
      <div className="relative rounded-[16px] overflow-hidden border lux-border-subtle obsidian-display-screen">
        <canvas
          ref={canvasRef}
          className="w-full h-[225px] sm:h-[245px] block cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            dragRef.current.active = false;
            setTraceX(null);
          }}
          onWheel={handleWheel}
        />

        {/* Floating Zoom & Reset Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => zoomBy(1.35)}
            aria-label="Zoom in"
            className="w-8 h-8 rounded-[8px] btn-obsidian-key flex items-center justify-center cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.35)}
            aria-label="Zoom out"
            className="w-8 h-8 rounded-[8px] btn-obsidian-key flex items-center justify-center cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setViewport(DEFAULT_VIEWPORT);
              setTraceX(null);
            }}
            aria-label="Reset graph view"
            className="w-8 h-8 rounded-[8px] btn-obsidian-key flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Trace Coordinate Readout */}
        <div className="px-3 py-1.5 bg-[#0c0d10]/90 border-t lux-border-subtle flex items-center justify-between text-[11px] font-mono tabular-nums">
          {traceX !== null ? (
            <div className="flex items-center gap-3 truncate">
              <span className="lux-text-soft">
                x = {traceX.toFixed(2)}
              </span>
              <span className="lux-text-bright font-semibold">
                f(x) = {traceY !== null ? traceY.toFixed(3) : 'undef'}
              </span>
              {showGx && gxExpr.trim() && (
                <span className="text-sky-400 font-semibold">
                  g(x) = {traceGy !== null ? traceGy.toFixed(3) : 'undef'}
                </span>
              )}
            </div>
          ) : (
            <span className="lux-text-muted truncate">
              Drag to pan · Tap or hover to trace · Scroll to zoom
            </span>
          )}
        </div>
      </div>

      {/* Preset Function Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto gold-scroll pt-0.5">
        <span className="text-[10px] lux-text-muted shrink-0">Presets:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setFxExpr(p.expr);
              setActiveInput('fx');
            }}
            className="min-h-[30px] px-2.5 rounded-[8px] btn-obsidian-key text-[11px] font-mono shrink-0 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
