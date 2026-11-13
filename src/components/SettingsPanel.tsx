import { useEffect } from 'react';
import { Check, Download, Trash2 } from 'lucide-react';
import type { AngleMode } from '../utils/mathEngine';

export type LuxTheme = 'gold' | 'rose-gold' | 'platinum';

export interface ThemeOption {
  id: LuxTheme;
  label: string;
  subtitle: string;
  swatchStyle: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'gold',
    label: '24K Gold',
    subtitle: 'Signature lustrous yellow gold & smoked bronze',
    swatchStyle:
      'linear-gradient(135deg, #fff199 0%, #ffd000 50%, #c68b00 100%)',
  },
  {
    id: 'rose-gold',
    label: 'Rose Gold',
    subtitle: 'Warm 18K blush copper & deep espresso',
    swatchStyle:
      'linear-gradient(135deg, #ffe2da 0%, #f1a392 50%, #b55e4f 100%)',
  },
  {
    id: 'platinum',
    label: 'Brushed Platinum',
    subtitle: 'Mirror-brushed silver titanium & gunmetal',
    swatchStyle:
      'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #8693a6 100%)',
  },
];

interface SettingsPanelProps {
  theme: LuxTheme;
  onThemeChange: (theme: LuxTheme) => void;
  angleMode: AngleMode;
  onAngleModeChange: (mode: AngleMode) => void;
  historyCount: number;
  onExportHistory: () => void;
  onClearHistory: () => void;
  onDisplaySync: (expression: string, result: string) => void;
}

export function SettingsPanel({
  theme,
  onThemeChange,
  angleMode,
  onAngleModeChange,
  historyCount,
  onExportHistory,
  onClearHistory,
  onDisplaySync,
}: SettingsPanelProps) {
  useEffect(() => {
    const active = THEME_OPTIONS.find((t) => t.id === theme);
    onDisplaySync('Active Theme', active?.label ?? '24K Gold');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-4 space-y-4">
      <div className="border-b lux-border-subtle pb-2 flex items-center justify-between">
        <span className="text-[14px] font-semibold lux-text-bright">
          Settings
        </span>
        <span className="text-[11px] font-mono lux-text-muted">
          Appearance & Preferences
        </span>
      </div>

      {/* Metallic Finish Theme Picker */}
      <div className="space-y-2">
        <div className="text-[12px] font-medium lux-text-soft">
          Metallic Finish Theme
        </div>
        <div className="space-y-2">
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => onThemeChange(opt.id)}
                className={`w-full min-h-[56px] rounded-[14px] px-3.5 py-2.5 flex items-center gap-3 text-left transition-all cursor-pointer ${
                  active
                    ? 'mode-tab-active font-bold'
                    : 'btn-obsidian-key'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-[10px] shrink-0 border border-black/35 shadow-inner"
                  style={{ background: opt.swatchStyle }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold leading-tight">
                    {opt.label}
                  </div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      active ? 'text-black/75' : 'lux-text-muted'
                    }`}
                  >
                    {opt.subtitle}
                  </div>
                </div>
                {active && (
                  <Check className="w-4 h-4 shrink-0 text-black stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scientific Angle Unit */}
      <div className="space-y-2 pt-1 border-t lux-border-subtle">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium lux-text-soft">
            Scientific Angle Unit
          </span>
          <div className="grid grid-cols-2 gap-1.5 w-[140px]">
            {(['DEG', 'RAD'] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => onAngleModeChange(unit)}
                className={`min-h-[38px] rounded-[10px] text-[12px] font-bold cursor-pointer ${
                  angleMode === unit ? 'btn-gold-key' : 'btn-obsidian-key'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Management */}
      <div className="pt-2 border-t lux-border-subtle flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div className="text-[12px] font-medium lux-text-soft">
            Calculation History
          </div>
          <div className="text-[11px] lux-text-muted">
            {historyCount} saved {historyCount === 1 ? 'entry' : 'entries'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={historyCount === 0}
            onClick={onExportHistory}
            className="min-h-[40px] px-3 rounded-[11px] btn-gold-key text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            disabled={historyCount === 0}
            onClick={onClearHistory}
            className="min-h-[40px] px-3 rounded-[11px] btn-obsidian-key text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>
    </div>
  );
}
