import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  ArrowLeftRight,
  RefreshCw,
  ChevronDown,
  Search,
  LineChart,
  Check,
  X,
} from 'lucide-react';
import {
  UNIT_CATEGORIES,
  UnitCategoryId,
  convertUnitValue,
} from '../utils/unitData';
import {
  formatDisplayNumber,
  formatExpressionWithCommas,
} from '../utils/mathEngine';
import {
  buildAllCurrencyList,
  getCurrencyMeta,
} from '../utils/currencyDirectory';
import { CurrencyRateChart } from './CurrencyRateChart';

interface UnitConverterProps {
  initialCategory?: UnitCategoryId;
  onDisplaySync: (expression: string, result: string) => void;
  onRecordHistory?: (expr: string, result: string) => void;
}

interface RatesState {
  rates: Record<string, number> | null;
  updatedAt: string | null;
  provider: string | null;
  loading: boolean;
  error: string | null;
}

export function UnitConverter({
  initialCategory = 'length',
  onDisplaySync,
  onRecordHistory,
}: UnitConverterProps) {
  const [categoryId, setCategoryId] = useState<UnitCategoryId>(initialCategory);
  const currentCategory =
    UNIT_CATEGORIES.find((c) => c.id === categoryId) ?? UNIT_CATEGORIES[0];

  const [fromUnit, setFromUnit] = useState<string>(currentCategory.units[0].id);
  const [toUnit, setToUnit] = useState<string>(
    currentCategory.id === 'currency' ? 'EUR' : currentCategory.units[0].id
  );
  const [amountStr, setAmountStr] = useState<string>('20');
  const [ratesState, setRatesState] = useState<RatesState>({
    rates: null,
    updatedAt: null,
    provider: null,
    loading: false,
    error: null,
  });

  // Currency picker modal/drawer + Graph toggle
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to' | null>(null);
  const [currencySearch, setCurrencySearch] = useState<string>('');
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCategoryId(initialCategory);
    const cat = UNIT_CATEGORIES.find((c) => c.id === initialCategory);
    if (cat) {
      if (initialCategory === 'currency') {
        setFromUnit('USD');
        setToUnit('EUR');
        setAmountStr('100');
      } else {
        setFromUnit(cat.units[0].id);
        setToUnit(cat.units[0].id);
      }
    }
  }, [initialCategory]);

  useEffect(() => {
    if (pickerTarget) {
      setCurrencySearch('');
      setTimeout(() => searchInputRef.current?.focus(), 20);
    }
  }, [pickerTarget]);

  const fetchRates = useCallback(async (forceRefresh = false) => {
    setRatesState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(
        `/api/currency-rates${forceRefresh ? '?refresh=1' : ''}`
      );
      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.rates) {
        throw new Error(data?.error || 'Could not load live currency rates');
      }
      setRatesState({
        rates: data.rates,
        updatedAt: data.updatedAt,
        provider: data.provider,
        loading: false,
        error: null,
      });
    } catch (err) {
      setRatesState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : 'Unable to fetch exchange rates',
      }));
    }
  }, []);

  useEffect(() => {
    if (categoryId === 'currency' && !ratesState.rates && !ratesState.loading) {
      fetchRates(false);
    }
  }, [categoryId, ratesState.rates, ratesState.loading, fetchRates]);

  const allCurrencies = useMemo(
    () => buildAllCurrencyList(ratesState.rates),
    [ratesState.rates]
  );

  const filteredCurrencies = useMemo(() => {
    const q = currencySearch.trim().toLowerCase();
    if (!q) return allCurrencies;
    return allCurrencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [allCurrencies, currencySearch]);

  const handleCategoryChange = (nextId: UnitCategoryId) => {
    setCategoryId(nextId);
    setPickerTarget(null);
    if (nextId !== 'currency') {
      setShowGraph(false);
    }
    const cat = UNIT_CATEGORIES.find((c) => c.id === nextId);
    if (cat) {
      if (nextId === 'currency') {
        setFromUnit('USD');
        setToUnit('EUR');
        setAmountStr('100');
      } else {
        setFromUnit(cat.units[0].id);
        setToUnit(cat.units[1]?.id ?? cat.units[0].id);
      }
    }
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const numericValue = parseFloat(amountStr);
  const isValidNumber = !Number.isNaN(numericValue);

  const convertedValue =
    isValidNumber && (categoryId !== 'currency' || ratesState.rates !== null)
      ? convertUnitValue(
          categoryId,
          numericValue,
          fromUnit,
          toUnit,
          ratesState.rates ?? undefined
        )
      : null;

  const fromDef = currentCategory.units.find((u) => u.id === fromUnit);
  const toDef = currentCategory.units.find((u) => u.id === toUnit);

  const fromCurrencyMeta = useMemo(
    () => (categoryId === 'currency' ? getCurrencyMeta(fromUnit) : null),
    [categoryId, fromUnit]
  );
  const toCurrencyMeta = useMemo(
    () => (categoryId === 'currency' ? getCurrencyMeta(toUnit) : null),
    [categoryId, toUnit]
  );

  const formattedAmount = formatExpressionWithCommas(amountStr || '0');

  const formattedResult =
    convertedValue !== null
      ? categoryId === 'currency'
        ? convertedValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })
        : formatExpressionWithCommas(formatDisplayNumber(convertedValue))
      : '—';

  const fromDisplayLabel =
    categoryId === 'currency' && fromCurrencyMeta
      ? `${fromCurrencyMeta.name} (${fromCurrencyMeta.country})`
      : fromDef?.label ?? fromUnit;

  const toDisplayLabel =
    categoryId === 'currency' && toCurrencyMeta
      ? `${toCurrencyMeta.name} (${toCurrencyMeta.country})`
      : toDef?.label ?? toUnit;

  const resultSentence =
    convertedValue !== null
      ? `${formattedAmount} ${fromDisplayLabel} = ${formattedResult} ${toDisplayLabel}`
      : categoryId === 'currency' && ratesState.loading
      ? 'Loading live currency rates...'
      : 'Enter a valid number';

  const runConvert = () => {
    if (convertedValue === null) return;
    const rawStr =
      categoryId === 'currency'
        ? convertedValue.toFixed(4).replace(/\.?0+$/, '')
        : formatDisplayNumber(convertedValue);
    onDisplaySync(resultSentence, formattedResult);
    onRecordHistory?.(resultSentence, rawStr);
  };

  useEffect(() => {
    if (convertedValue !== null) {
      const displayStr =
        categoryId === 'currency'
          ? convertedValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : formatExpressionWithCommas(formatDisplayNumber(convertedValue));
      const fromShort =
        categoryId === 'currency' ? fromUnit : fromDef?.shortLabel ?? fromUnit;
      const toShort =
        categoryId === 'currency' ? toUnit : toDef?.shortLabel ?? toUnit;
      onDisplaySync(`${formattedAmount} ${fromShort} → ${toShort}`, displayStr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountStr, fromUnit, toUnit, categoryId, ratesState.rates]);

  const unitRatePreview =
    categoryId === 'currency' &&
    ratesState.rates &&
    ratesState.rates[fromUnit] &&
    ratesState.rates[toUnit]
      ? `1 ${fromUnit} = ${(
          ratesState.rates[toUnit] / ratesState.rates[fromUnit]
        ).toFixed(4)} ${toUnit}`
      : null;

  const selectCurrency = (code: string) => {
    if (pickerTarget === 'from') setFromUnit(code);
    else if (pickerTarget === 'to') setToUnit(code);
    setPickerTarget(null);
  };

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-4 space-y-3 relative">
      {/* Category Selector */}
      <div className="relative">
        <select
          value={categoryId}
          onChange={(e) =>
            handleCategoryChange(e.target.value as UnitCategoryId)
          }
          aria-label="Conversion category"
          className="w-full appearance-none lux-select-tray font-medium text-[15px] rounded-[12px] px-4 py-3 pr-10 cursor-pointer"
        >
          {UNIT_CATEGORIES.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
              className="bg-[#18191d] lux-text-accent"
            >
              {cat.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 lux-text-accent pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Live Currency Bar with Graph & Refresh controls */}
      {categoryId === 'currency' && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-[10px] bg-[#16171a]/85 border lux-border-subtle text-[12px] lux-text-soft">
          <div className="truncate font-mono tabular-nums">
            {ratesState.loading
              ? 'Fetching live FX rates...'
              : ratesState.error
              ? ratesState.error
              : unitRatePreview ?? 'Live FX ready'}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowGraph((g) => !g)}
              aria-pressed={showGraph}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold cursor-pointer ${
                showGraph ? 'btn-gold-key' : 'btn-obsidian-key'
              }`}
              title="Toggle exchange rate graph"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Graph</span>
            </button>
            <button
              type="button"
              onClick={() => fetchRates(true)}
              disabled={ratesState.loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md btn-obsidian-key text-[12px] cursor-pointer disabled:opacity-50"
              title="Refresh live exchange rates"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  ratesState.loading ? 'animate-spin' : ''
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* Amount & Unit/Currency Selectors */}
      {categoryId === 'currency' ? (
        <div className="space-y-2">
          <input
            type="number"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            aria-label="Amount to convert"
            className="w-full min-h-[46px] lux-input rounded-[12px] px-3.5 py-2 font-mono tabular-nums text-[16px]"
            placeholder="0"
          />

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {/* Searchable From Currency Button */}
            <button
              type="button"
              onClick={() => setPickerTarget('from')}
              className="min-h-[54px] rounded-[12px] lux-select-tray px-3 py-2 text-left flex items-center justify-between gap-1.5 cursor-pointer hover:brightness-110 transition-all min-w-0"
              aria-label="Select source currency"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-bold lux-text-bright leading-tight">
                  {fromUnit}
                </div>
                <div className="text-[10px] lux-text-muted truncate mt-0.5">
                  {fromCurrencyMeta?.country}
                </div>
                <div className="text-[10px] lux-text-soft truncate">
                  {fromCurrencyMeta?.name}
                </div>
              </div>
              <Search className="w-3.5 h-3.5 lux-text-muted shrink-0" />
            </button>

            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap currencies"
              className="min-h-[44px] min-w-[44px] rounded-[12px] btn-obsidian-key flex items-center justify-center cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* Searchable To Currency Button */}
            <button
              type="button"
              onClick={() => setPickerTarget('to')}
              className="min-h-[54px] rounded-[12px] lux-select-tray px-3 py-2 text-left flex items-center justify-between gap-1.5 cursor-pointer hover:brightness-110 transition-all min-w-0"
              aria-label="Select target currency"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-bold lux-text-bright leading-tight">
                  {toUnit}
                </div>
                <div className="text-[10px] lux-text-muted truncate mt-0.5">
                  {toCurrencyMeta?.country}
                </div>
                <div className="text-[10px] lux-text-soft truncate">
                  {toCurrencyMeta?.name}
                </div>
              </div>
              <Search className="w-3.5 h-3.5 lux-text-muted shrink-0" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[1.1fr_1fr_auto_1fr] items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            aria-label="Amount to convert"
            className="col-span-3 sm:col-span-1 w-full min-h-[46px] lux-input rounded-[12px] px-3.5 py-2 font-mono tabular-nums text-[16px]"
            placeholder="0"
          />

          <div className="relative">
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              aria-label="From unit"
              className="w-full min-h-[46px] appearance-none lux-select-tray text-[13px] font-medium rounded-[12px] pl-3 pr-7 py-2 cursor-pointer truncate"
            >
              {currentCategory.units.map((u) => (
                <option
                  key={u.id}
                  value={u.id}
                  className="bg-[#18191d] lux-text-accent"
                >
                  {u.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 lux-text-accent pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap units"
            className="min-h-[44px] min-w-[44px] rounded-[12px] btn-obsidian-key flex items-center justify-center cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <div className="relative">
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              aria-label="To unit"
              className="w-full min-h-[46px] appearance-none lux-select-tray text-[13px] font-medium rounded-[12px] pl-3 pr-7 py-2 cursor-pointer truncate"
            >
              {currentCategory.units.map((u) => (
                <option
                  key={u.id}
                  value={u.id}
                  className="bg-[#18191d] lux-text-accent"
                >
                  {u.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 lux-text-accent pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}

      {/* Prominent Metallic CONVERT Button */}
      <button
        type="button"
        onClick={runConvert}
        className="w-full min-h-[48px] rounded-[14px] btn-gold-key font-bold tracking-[0.12em] text-[14px] uppercase cursor-pointer"
      >
        CONVERT
      </button>

      {/* Recessed Obsidian Result Box */}
      <div className="w-full min-h-[60px] rounded-[14px] obsidian-display-screen border lux-border-subtle px-4 py-3 flex flex-col items-center justify-center text-center">
        <p className="lux-text-bright font-bold text-[14px] sm:text-[15px] font-mono tabular-nums break-words">
          {resultSentence}
        </p>
        {categoryId === 'currency' && ratesState.updatedAt && (
          <p className="mt-1 text-[11px] lux-text-muted">
            Live rate · {allCurrencies.length} currencies ·{' '}
            {new Date(ratesState.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Interactive Historical Exchange Rate Graph */}
      {categoryId === 'currency' && showGraph && (
        <CurrencyRateChart fromCode={fromUnit} toCode={toUnit} />
      )}

      {/* Searchable Currency Directory Modal Overlay */}
      {pickerTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-[420px] rounded-[24px] bg-[#141519] border lux-border-strong p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold lux-text-bright">
                  Select {pickerTarget === 'from' ? 'From' : 'To'} Currency
                </h3>
                <p className="text-[11px] lux-text-muted">
                  Search all {allCurrencies.length} world currencies by name,
                  country, or code
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerTarget(null)}
                className="p-2 lux-text-muted hover:lux-text-bright cursor-pointer"
                aria-label="Close currency search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 lux-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                placeholder="Search e.g. Morocco, Yen, AED, Brazil..."
                className="w-full min-h-[44px] lux-input rounded-[12px] pl-9 pr-8 py-2 text-[13px]"
              />
              {currencySearch && (
                <button
                  type="button"
                  onClick={() => setCurrencySearch('')}
                  className="p-1 lux-text-muted hover:lux-text-bright absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-[52vh] overflow-y-auto gold-scroll divide-y divide-white/10 pr-1">
              {filteredCurrencies.length === 0 ? (
                <p className="py-8 text-center text-[13px] lux-text-muted">
                  No currencies matching &ldquo;{currencySearch}&rdquo;
                </p>
              ) : (
                filteredCurrencies.map((c) => {
                  const selected =
                    (pickerTarget === 'from' && c.code === fromUnit) ||
                    (pickerTarget === 'to' && c.code === toUnit);
                  const usdRate = ratesState.rates?.[c.code];
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => selectCurrency(c.code)}
                      className={`w-full min-h-[52px] py-2 px-2.5 text-left rounded-xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                        selected ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span className="w-11 py-1 rounded-md btn-obsidian-key text-[12px] font-bold font-mono text-center shrink-0">
                          {c.code}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold lux-text-bright truncate">
                            {c.name}
                          </div>
                          <div className="text-[11px] lux-text-muted truncate">
                            {c.country}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {typeof usdRate === 'number' && (
                          <span className="text-[11px] font-mono tabular-nums lux-text-soft">
                            {usdRate >= 100
                              ? usdRate.toLocaleString('en-US', {
                                  maximumFractionDigits: 1,
                                })
                              : usdRate.toFixed(3)}
                          </span>
                        )}
                        {selected && (
                          <Check className="w-4 h-4 lux-text-bright shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
