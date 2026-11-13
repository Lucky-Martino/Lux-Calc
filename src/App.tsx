import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Landmark,
  CalendarClock,
  PiggyBank,
  TrendingUp,
  Home,
  Wallet,
  Settings,
  Info,
  ChevronRight,
  Copy,
  Check,
  History,
  Trash2,
  Download,
  LineChart,
  Calculator as CalcIcon,
  X,
} from 'lucide-react';
import {
  AngleMode,
  evaluateExpression,
  formatDisplayNumber,
  formatExpressionWithCommas,
} from './utils/mathEngine';
import { StandardKeypad } from './components/StandardKeypad';
import { ScientificKeypad } from './components/ScientificKeypad';
import { ScientificGrapher } from './components/ScientificGrapher';
import { UnitConverter } from './components/UnitConverter';
import { FinanceCalculator } from './components/FinanceCalculator';
import { DateTimeCalculator } from './components/DateTimeCalculator';
import { SavingsCalculator } from './components/SavingsCalculator';
import { InvestmentCalculator } from './components/InvestmentCalculator';
import { MortgageCalculator } from './components/MortgageCalculator';
import { BudgetPlanner } from './components/BudgetPlanner';
import {
  SettingsPanel,
  THEME_OPTIONS,
  type LuxTheme,
} from './components/SettingsPanel';
import { AboutPanel } from './components/AboutPanel';

type AppMode =
  | 'calculator'
  | 'scientific'
  | 'converter'
  | 'finance'
  | 'savings'
  | 'investment'
  | 'mortgage'
  | 'budget'
  | 'datetime'
  | 'settings'
  | 'about';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  mode: string;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = 'lux_calc_history_v1';
const THEME_STORAGE_KEY = 'lux_calc_theme_v1';

export default function App() {
  const [theme, setTheme] = useState<LuxTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'gold' || saved === 'rose-gold' || saved === 'platinum') {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    return 'gold';
  });

  const [mode, setMode] = useState<AppMode>('calculator');
  const [scientificView, setScientificView] = useState<'keypad' | 'graph'>(
    'keypad'
  );

  // Calculator expression & display state
  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [hasError, setHasError] = useState<boolean>(false);

  // Sync display text when using converter / finance / planner / settings / about
  const [toolSubLabel, setToolSubLabel] = useState<string>('');
  const [toolReadout, setToolReadout] = useState<string>('0');

  // More Menu & Mobile History Modal
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as HistoryItem[];
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(history.slice(0, 40))
      );
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  // Close More menu on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      ) {
        setMoreMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreMenuOpen(false);
        setMobileHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const recordHistory = useCallback(
    (expr: string, res: string, modeLabel: string) => {
      setHistory((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          expression: expr,
          result: res,
          mode: modeLabel,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 39),
      ]);
    },
    []
  );

  const isBinaryOperator = (ch: string) =>
    ['+', '-', '×', '÷', '^'].includes(ch);

  const handleInput = useCallback(
    (token: string) => {
      setHasError(false);

      setExpression((prev) => {
        let base = prev;

        if (justEvaluated) {
          if (
            isBinaryOperator(token) ||
            token === '%' ||
            token === '!' ||
            token === '²'
          ) {
            base = displayValue === 'Error' ? '0' : displayValue;
          } else {
            base = '';
          }
          setJustEvaluated(false);
        }

        if (base === '' && ['+', '×', '÷', '^', '%', '!', '²'].includes(token)) {
          const next = `0${token}`;
          setDisplayValue(next);
          return next;
        }

        const lastChar = base.slice(-1);
        if (isBinaryOperator(token) && isBinaryOperator(lastChar)) {
          const replaced = base.slice(0, -1) + token;
          setDisplayValue(replaced);
          return replaced;
        }

        const next = base + token;
        setDisplayValue(next);
        return next;
      });
    },
    [displayValue, justEvaluated]
  );

  const handleClear = useCallback(() => {
    setExpression('');
    setDisplayValue('0');
    setJustEvaluated(false);
    setHasError(false);
  }, []);

  const handleBackspace = useCallback(() => {
    setHasError(false);
    if (justEvaluated) {
      setExpression('');
      setDisplayValue('0');
      setJustEvaluated(false);
      return;
    }

    setExpression((prev) => {
      if (!prev) {
        setDisplayValue('0');
        return '';
      }
      const fnMatch = prev.match(/(sin\(|cos\(|tan\(|log\(|ln\(|√\()$/);
      const next = fnMatch
        ? prev.slice(0, -fnMatch[0].length)
        : prev.slice(0, -1);
      setDisplayValue(next || '0');
      return next;
    });
  }, [justEvaluated]);

  const handleEvaluate = useCallback(() => {
    const exprToEval = expression || displayValue;
    if (!exprToEval || exprToEval === 'Error') return;

    try {
      const opens = (exprToEval.match(/\(/g) || []).length;
      const closes = (exprToEval.match(/\)/g) || []).length;
      const balancedExpr =
        opens > closes
          ? exprToEval + ')'.repeat(opens - closes)
          : exprToEval;

      const numeric = evaluateExpression(balancedExpr, angleMode);
      const formatted = formatDisplayNumber(numeric);
      setExpression(balancedExpr);
      setDisplayValue(formatted);
      setJustEvaluated(true);
      setHasError(false);
      recordHistory(
        balancedExpr,
        formatted,
        mode === 'scientific' ? `Scientific (${angleMode})` : 'Calculator'
      );
    } catch {
      setDisplayValue('Error');
      setHasError(true);
      setJustEvaluated(true);
    }
  }, [angleMode, displayValue, expression, mode, recordHistory]);

  // Physical keyboard support in Calculator / Scientific Keypad modes
  useEffect(() => {
    if (
      mode !== 'calculator' &&
      !(mode === 'scientific' && scientificView === 'keypad')
    )
      return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (/^[0-9.()^%]$/.test(e.key)) {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === '+') {
        e.preventDefault();
        handleInput('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleInput('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleInput('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    mode,
    scientificView,
    handleInput,
    handleEvaluate,
    handleBackspace,
    handleClear,
  ]);

  const handleToolDisplaySync = useCallback(
    (subLabel: string, readout: string) => {
      setToolSubLabel(subLabel);
      setToolReadout(readout);
    },
    []
  );

  const isCalcMode =
    mode === 'calculator' ||
    (mode === 'scientific' && scientificView === 'keypad');
  const activeScreenMain = isCalcMode
    ? formatExpressionWithCommas(displayValue)
    : toolReadout;
  const activeScreenSub = isCalcMode
    ? justEvaluated && expression
      ? `${formatExpressionWithCommas(expression)} =`
      : expression
      ? ' '
      : ''
    : toolSubLabel;

  const copyReadout = async () => {
    try {
      await navigator.clipboard.writeText(isCalcMode ? displayValue : toolReadout);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked
    }
  };

  const openMoreDestination = (targetMode: AppMode) => {
    setMode(targetMode);
    setMoreMenuOpen(false);
  };

  const isMoreActive =
    mode === 'finance' ||
    mode === 'savings' ||
    mode === 'investment' ||
    mode === 'mortgage' ||
    mode === 'budget' ||
    mode === 'datetime' ||
    mode === 'settings' ||
    mode === 'about';

  const loadHistoryItem = (item: HistoryItem) => {
    if (item.mode.startsWith('Scientific')) {
      setMode('scientific');
    } else if (item.mode === 'Calculator') {
      setMode('calculator');
    }
    setExpression(item.result);
    setDisplayValue(item.result);
    setJustEvaluated(false);
    setHasError(false);
    setMobileHistoryOpen(false);
  };

  const exportHistoryCsv = useCallback(() => {
    if (history.length === 0) return;

    const escapeCsv = (val: string) => {
      const str = String(val ?? '');
      if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const header = ['Timestamp', 'Mode', 'Expression', 'Result'];
    const rows = history.map((item) => [
      escapeCsv(new Date(item.timestamp).toISOString()),
      escapeCsv(item.mode),
      escapeCsv(item.expression),
      escapeCsv(item.result),
    ]);

    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join(
      '\r\n'
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateSlug = new Date().toISOString().slice(0, 10);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lux-calc-history-${dateSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [history]);

  const moreMenuItems: {
    id: AppMode;
    title: string;
    subtitle: string;
    icon: typeof Landmark;
  }[] = [
    {
      id: 'finance',
      title: 'Finance Calculator',
      subtitle: 'Loan, compound interest, NPV, IRR, tip',
      icon: Landmark,
    },
    {
      id: 'savings',
      title: 'Savings Calculator',
      subtitle: 'APY growth & savings goal tracker',
      icon: PiggyBank,
    },
    {
      id: 'investment',
      title: 'Investment Calculator',
      subtitle: 'Nominal & inflation-adjusted projection',
      icon: TrendingUp,
    },
    {
      id: 'mortgage',
      title: 'Mortgage Calculator',
      subtitle: 'Monthly PITI, property tax & LTV',
      icon: Home,
    },
    {
      id: 'budget',
      title: 'Budget Planner',
      subtitle: 'Monthly income, expenses & surplus',
      icon: Wallet,
    },
    {
      id: 'datetime',
      title: 'Date & Time Calculator',
      subtitle: 'Date difference, add/sub days, time math',
      icon: CalendarClock,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Themes (24K Gold, Rose Gold, Platinum)',
      icon: Settings,
    },
    {
      id: 'about',
      title: 'About Us',
      subtitle: 'Developed by J L Martin',
      icon: Info,
    },
  ];

  const modeLabelMap: Record<AppMode, string> = {
    calculator: 'Standard',
    scientific: `Scientific · ${angleMode}`,
    converter: 'Unit & Currency Converter',
    finance: 'Finance Calculator',
    savings: 'Savings Calculator',
    investment: 'Investment Calculator',
    mortgage: 'Mortgage Calculator',
    budget: 'Budget Planner',
    datetime: 'Date & Time Calculator',
    settings: 'Settings',
    about: 'About Us',
  };

  return (
    <div
      data-theme={theme}
      className="min-h-screen lux-stage-bg flex flex-col items-center justify-center p-2 sm:p-5 lg:p-8"
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[minmax(350px,420px)_1fr] gap-6 lg:gap-8 items-start justify-center">
        {/* PRIMARY ANDROID DEVICE CHASSIS — LUX CALC */}
        <main className="w-full max-w-[420px] mx-auto gold-chassis gold-shimmer-sweep rounded-[34px] p-3.5 sm:p-4 relative">
          {/* Top Brand Plate: "Lux Calc" */}
          <header className="flex items-center justify-center pt-1 pb-3">
            <div className="gold-brand-plate rounded-[15px] px-7 py-2 flex items-center justify-center">
              <h1
                className="text-[22px] sm:text-[24px] font-bold tracking-[0.04em] gold-text-foil leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Lux&nbsp;&nbsp;Calc
              </h1>
            </div>
          </header>

          {/* Recessed Obsidian Display Bezel */}
          <section
            aria-label="Calculator display"
            className="obsidian-display-bezel rounded-[22px] p-3 mb-3.5"
          >
            <div className="obsidian-display-screen rounded-[15px] px-4 py-3 min-h-[86px] flex flex-col justify-between">
              {/* Top utility micro-row inside screen */}
              <div className="flex items-center justify-between gap-2 min-h-[22px]">
                <div className="flex items-center gap-1.5">
                  {mode === 'scientific' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setAngleMode((a) => (a === 'DEG' ? 'RAD' : 'DEG'))
                        }
                        className="px-2 py-0.5 rounded bg-[#23252c] border lux-border-subtle text-[10px] font-bold tracking-wider lux-text-bright hover:brightness-110 cursor-pointer"
                        title="Toggle Degrees / Radians"
                      >
                        {angleMode}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setScientificView((v) =>
                            v === 'keypad' ? 'graph' : 'keypad'
                          )
                        }
                        aria-pressed={scientificView === 'graph'}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide inline-flex items-center gap-1 cursor-pointer transition-colors ${
                          scientificView === 'graph'
                            ? 'btn-gold-key'
                            : 'bg-[#23252c] border lux-border-subtle lux-text-bright hover:brightness-110'
                        }`}
                        title={
                          scientificView === 'graph'
                            ? 'Switch to Scientific Keypad'
                            : 'Open Function Grapher'
                        }
                      >
                        {scientificView === 'graph' ? (
                          <>
                            <CalcIcon className="w-3 h-3" />
                            <span>Keypad</span>
                          </>
                        ) : (
                          <>
                            <LineChart className="w-3 h-3" />
                            <span>Graph</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={copyReadout}
                    className="p-1 rounded lux-text-muted hover:lux-text-bright transition-colors cursor-pointer"
                    title="Copy value"
                    aria-label="Copy display value"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 lux-text-bright" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileHistoryOpen(true)}
                    className="lg:hidden p-1 rounded lux-text-muted hover:lux-text-bright transition-colors cursor-pointer"
                    title="Calculation history"
                    aria-label="Open calculation history"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[12px] font-mono tabular-nums lux-text-muted truncate max-w-[230px] text-right">
                  {activeScreenSub}
                </span>
              </div>

              {/* Main Tabular Numeric Readout */}
              <div
                className={`text-right font-mono tabular-nums font-bold tracking-tight leading-tight overflow-x-auto gold-scroll whitespace-nowrap pt-1 ${
                  hasError
                    ? 'text-amber-400 text-[28px]'
                    : activeScreenMain.length > 14
                    ? 'lux-text-bright text-[24px] sm:text-[26px]'
                    : activeScreenMain.length > 10
                    ? 'lux-text-bright text-[28px] sm:text-[31px]'
                    : 'lux-text-bright text-[33px] sm:text-[36px]'
                }`}
                style={{
                  textShadow: '0 0 14px var(--lux-readout-glow)',
                }}
              >
                {activeScreenMain}
              </div>
            </div>
          </section>

          {/* 4-Button Mode Selector Strip: Calculator | Scientific | Unit Converter | More */}
          <nav
            aria-label="Calculator modes"
            className="grid grid-cols-4 gap-2 mb-3.5 relative"
            ref={moreMenuRef}
          >
            <button
              type="button"
              onClick={() => {
                setMode('calculator');
                setMoreMenuOpen(false);
              }}
              className={`min-h-[54px] rounded-[13px] px-1.5 py-2 text-[12px] sm:text-[13px] font-semibold flex items-center justify-center text-center leading-tight transition-all cursor-pointer ${
                mode === 'calculator'
                  ? 'mode-tab-active font-bold'
                  : 'mode-tab-inactive'
              }`}
            >
              Calculator
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('scientific');
                setMoreMenuOpen(false);
              }}
              className={`min-h-[54px] rounded-[13px] px-1.5 py-2 text-[12px] sm:text-[13px] font-semibold flex items-center justify-center text-center leading-tight transition-all cursor-pointer ${
                mode === 'scientific'
                  ? 'mode-tab-active font-bold'
                  : 'mode-tab-inactive'
              }`}
            >
              Scientific
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('converter');
                setMoreMenuOpen(false);
              }}
              className={`min-h-[54px] rounded-[13px] px-1.5 py-2 text-[12px] sm:text-[13px] font-semibold flex items-center justify-center text-center leading-tight transition-all cursor-pointer ${
                mode === 'converter'
                  ? 'mode-tab-active font-bold'
                  : 'mode-tab-inactive'
              }`}
            >
              Unit Converter
            </button>

            <button
              type="button"
              onClick={() => setMoreMenuOpen((open) => !open)}
              aria-expanded={moreMenuOpen}
              aria-haspopup="menu"
              className={`min-h-[54px] rounded-[13px] px-1.5 py-2 text-[12px] sm:text-[13px] font-semibold flex items-center justify-center text-center leading-tight transition-all cursor-pointer ${
                isMoreActive || moreMenuOpen
                  ? 'mode-tab-active font-bold'
                  : 'mode-tab-inactive'
              }`}
            >
              More
            </button>

            {/* Popover Menu for "More" Button */}
            {moreMenuOpen && (
              <div
                role="menu"
                aria-label="More calculator tools"
                className="absolute right-0 top-[62px] z-30 w-full sm:w-[340px] max-h-[410px] overflow-y-auto gold-scroll rounded-[18px] bg-[#141519]/98 border lux-border-strong shadow-[0_20px_48px_rgba(0,0,0,0.88)] p-2 space-y-1.5 backdrop-blur-md"
              >
                <div className="px-2.5 pt-1 pb-1 text-[11px] font-semibold lux-text-muted tracking-wide">
                  More Tools &amp; Settings
                </div>

                {moreMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      onClick={() => openMoreDestination(item.id)}
                      className={`w-full min-h-[50px] rounded-[13px] px-3 py-2 flex items-center gap-3 text-left transition-colors cursor-pointer group border ${
                        active
                          ? 'bg-[#262830] lux-border-strong'
                          : 'bg-[#1e1f24] hover:bg-[#262830] lux-border-subtle hover:lux-border-strong'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-[9px] btn-gold-key flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold lux-text-bright leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[11px] lux-text-muted truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 lux-text-muted group-hover:lux-text-bright shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Active Keypad / Converter / Suite Body */}
          <section aria-label="Calculator controls">
            {mode === 'calculator' && (
              <StandardKeypad
                onInput={handleInput}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onEvaluate={handleEvaluate}
              />
            )}

            {mode === 'scientific' &&
              (scientificView === 'graph' ? (
                <ScientificGrapher
                  angleMode={angleMode}
                  initialExpression={expression}
                  onDisplaySync={handleToolDisplaySync}
                />
              ) : (
                <ScientificKeypad
                  onInput={handleInput}
                  onClear={handleClear}
                  onBackspace={handleBackspace}
                  onEvaluate={handleEvaluate}
                />
              ))}

            {mode === 'converter' && (
              <UnitConverter
                onDisplaySync={handleToolDisplaySync}
                onRecordHistory={(expr, res) =>
                  recordHistory(expr, res, 'Converter')
                }
              />
            )}

            {mode === 'finance' && (
              <FinanceCalculator onDisplaySync={handleToolDisplaySync} />
            )}

            {mode === 'savings' && (
              <SavingsCalculator onDisplaySync={handleToolDisplaySync} />
            )}

            {mode === 'investment' && (
              <InvestmentCalculator onDisplaySync={handleToolDisplaySync} />
            )}

            {mode === 'mortgage' && (
              <MortgageCalculator onDisplaySync={handleToolDisplaySync} />
            )}

            {mode === 'budget' && (
              <BudgetPlanner onDisplaySync={handleToolDisplaySync} />
            )}

            {mode === 'datetime' && (
              <DateTimeCalculator onDisplaySync={handleToolDisplaySync} />
            )}

            {mode === 'settings' && (
              <SettingsPanel
                theme={theme}
                onThemeChange={setTheme}
                angleMode={angleMode}
                onAngleModeChange={setAngleMode}
                historyCount={history.length}
                onExportHistory={exportHistoryCsv}
                onClearHistory={() => setHistory([])}
                onDisplaySync={handleToolDisplaySync}
              />
            )}

            {mode === 'about' && (
              <AboutPanel onDisplaySync={handleToolDisplaySync} />
            )}
          </section>
        </main>

        {/* DESKTOP COMPANION PANEL: Quick Suite Access & Calculation Tape */}
        <aside className="hidden lg:flex flex-col gap-5 bg-[#121317]/95 border lux-border-subtle rounded-[26px] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
          <div className="flex items-center justify-between border-b lux-border-subtle pb-4">
            <div>
              <h2
                className="text-[20px] font-bold gold-text-foil"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Lux Calc Suite
              </h2>
              <p className="text-[13px] lux-text-muted mt-0.5">
                {THEME_OPTIONS.find((t) => t.id === theme)?.label} finish ·
                Developed by J L Martin
              </p>
            </div>
            <span className="text-[12px] font-mono lux-text-soft">
              {modeLabelMap[mode]}
            </span>
          </div>

          {/* Quick Suite Launcher */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                id: 'finance' as const,
                title: 'Finance',
                desc: 'Loan, NPV, IRR, Tip',
                icon: Landmark,
              },
              {
                id: 'savings' as const,
                title: 'Savings',
                desc: 'APY & Goal Tracker',
                icon: PiggyBank,
              },
              {
                id: 'investment' as const,
                title: 'Investment',
                desc: 'Nominal & Real Growth',
                icon: TrendingUp,
              },
              {
                id: 'mortgage' as const,
                title: 'Mortgage',
                desc: 'PITI & LTV Breakdown',
                icon: Home,
              },
              {
                id: 'budget' as const,
                title: 'Budget',
                desc: 'Income & Expenses',
                icon: Wallet,
              },
              {
                id: 'settings' as const,
                title: 'Settings',
                desc: 'Gold, Rose, Platinum',
                icon: Settings,
              },
            ].map((card) => {
              const Icon = card.icon;
              const active = mode === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => openMoreDestination(card.id)}
                  className={`rounded-[15px] p-3 text-left border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#22242c] lux-border-strong'
                      : 'bg-[#191a1f] lux-border-subtle hover:lux-border-strong'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 lux-text-bright mb-1.5" />
                  <div className="text-[13px] font-semibold lux-text-bright">
                    {card.title}
                  </div>
                  <div className="text-[11px] lux-text-muted mt-0.5 truncate">
                    {card.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calculation History Ledger */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-[13px] font-semibold lux-text-accent">
                <History className="w-4 h-4" />
                <span>Calculation History</span>
              </div>
              {history.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={exportHistoryCsv}
                    className="inline-flex items-center gap-1 text-[12px] lux-text-bright hover:underline transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="inline-flex items-center gap-1 text-[12px] lux-text-muted hover:lux-text-bright transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-[16px] bg-[#0e0f12] border lux-border-subtle p-3 min-h-[260px] max-h-[320px] overflow-y-auto gold-scroll">
              {history.length === 0 ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-center px-4">
                  <p className="text-[13px] lux-text-muted">
                    Evaluated expressions and conversions appear here.
                  </p>
                  <p className="text-[12px] lux-text-dim mt-1">
                    Click any saved entry to reuse its result.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => loadHistoryItem(item)}
                      className="w-full py-2.5 px-2 text-left hover:bg-white/5 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[12px] lux-text-soft font-mono truncate">
                          {formatExpressionWithCommas(item.expression)}
                        </div>
                        <div className="text-[11px] lux-text-dim">
                          {item.mode}
                        </div>
                      </div>
                      <div className="text-[15px] font-bold font-mono tabular-nums lux-text-bright shrink-0">
                        = {formatExpressionWithCommas(item.result)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE HISTORY SHEET */}
      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 lg:hidden">
          <div className="w-full max-w-[420px] rounded-[24px] bg-[#141519] border lux-border-strong p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b lux-border-subtle">
              <div className="flex items-center gap-2 font-semibold lux-text-bright">
                <History className="w-4 h-4" />
                <span>Calculation History</span>
              </div>
              <div className="flex items-center gap-1.5">
                {history.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={exportHistoryCsv}
                      className="px-2.5 py-1.5 rounded-lg btn-gold-key text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      aria-label="Export history as CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistory([])}
                      className="p-2 lux-text-muted hover:lux-text-bright cursor-pointer"
                      aria-label="Clear history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setMobileHistoryOpen(false)}
                  className="p-2 lux-text-muted hover:lux-text-bright cursor-pointer"
                  aria-label="Close history"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto gold-scroll py-2 divide-y divide-white/10">
              {history.length === 0 ? (
                <p className="py-10 text-center text-[13px] lux-text-muted">
                  No calculations recorded yet.
                </p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadHistoryItem(item)}
                    className="w-full py-2.5 px-2 text-left hover:bg-white/5 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="text-[12px] font-mono lux-text-soft truncate">
                      {formatExpressionWithCommas(item.expression)}
                    </span>
                    <span className="text-[14px] font-bold font-mono tabular-nums lux-text-bright shrink-0">
                      = {formatExpressionWithCommas(item.result)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
