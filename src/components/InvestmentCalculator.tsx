import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { calculateInvestment, formatCurrency } from '../utils/financeMath';
import { formatFixedWithCommas } from '../utils/mathEngine';

interface InvestmentCalculatorProps {
  onDisplaySync: (expression: string, result: string) => void;
}

export function InvestmentCalculator({
  onDisplaySync,
}: InvestmentCalculatorProps) {
  const [startingCapital, setStartingCapital] = useState('15000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [annualReturn, setAnnualReturn] = useState('9.0');
  const [inflationRate, setInflationRate] = useState('2.5');
  const [years, setYears] = useState('20');
  const [showTable, setShowTable] = useState(false);

  const result = useMemo(() => {
    return calculateInvestment(
      parseFloat(startingCapital) || 0,
      parseFloat(monthlyContribution) || 0,
      parseFloat(annualReturn) || 0,
      parseFloat(inflationRate) || 0,
      parseFloat(years) || 1
    );
  }, [startingCapital, monthlyContribution, annualReturn, inflationRate, years]);

  useEffect(() => {
    onDisplaySync(
      `Portfolio (${years || 1} yr @ ${annualReturn || 0}%)`,
      formatFixedWithCommas(result.nominalBalance)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, years, annualReturn]);

  const inputClass =
    'w-full min-h-[42px] lux-input rounded-[10px] px-3 py-1.5 font-mono tabular-nums text-[14px]';
  const labelClass = 'block text-[11px] font-medium lux-text-soft mb-1';

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b lux-border-subtle pb-2">
        <span className="text-[13px] font-semibold lux-text-bright">
          Investment Calculator
        </span>
        <span className="text-[11px] font-mono lux-text-muted">
          Nominal & Real Value
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={labelClass}>Initial Capital ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={startingCapital}
            onChange={(e) => setStartingCapital(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Monthly Contribution ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Expected Return (%/yr)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.25"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className={labelClass}>Inflation (%)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Years</label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="obsidian-display-screen rounded-[14px] p-3.5 border lux-border-subtle grid grid-cols-2 gap-3 text-center">
        <div>
          <div className="text-[11px] lux-text-muted">Projected Value</div>
          <div className="text-[16px] font-bold font-mono tabular-nums lux-text-bright">
            {formatCurrency(result.nominalBalance)}
          </div>
        </div>
        <div>
          <div className="text-[11px] lux-text-muted">
            Inflation-Adjusted
          </div>
          <div className="text-[16px] font-bold font-mono tabular-nums lux-text-accent">
            {formatCurrency(result.realBalance)}
          </div>
        </div>
        <div className="pt-2 border-t lux-border-subtle">
          <div className="text-[11px] lux-text-muted">Total Invested</div>
          <div className="text-[13px] font-semibold font-mono tabular-nums lux-text-soft">
            {formatCurrency(result.totalInvested)}
          </div>
        </div>
        <div className="pt-2 border-t lux-border-subtle">
          <div className="text-[11px] lux-text-muted">Total Gain</div>
          <div className="text-[13px] font-semibold font-mono tabular-nums lux-text-bright">
            {formatCurrency(result.totalReturn)}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowTable((s) => !s)}
        className="w-full min-h-[42px] rounded-[12px] btn-obsidian-key text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>
          {showTable ? 'Hide Annual Projection' : 'View Annual Projection'}
        </span>
        {showTable ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {showTable && result.yearlyRows.length > 0 && (
        <div className="max-h-[175px] overflow-y-auto gold-scroll rounded-[12px] bg-[#121316] border lux-border-subtle">
          <table className="w-full text-[11px] font-mono tabular-nums text-left">
            <thead className="sticky top-0 bg-[#181a1f] lux-text-bright border-b lux-border-subtle">
              <tr>
                <th className="py-2 px-2.5">Yr</th>
                <th className="py-2 px-2">Invested</th>
                <th className="py-2 px-2">Nominal</th>
                <th className="py-2 px-2.5 text-right">Real</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 lux-text-soft">
              {result.yearlyRows.map((row) => (
                <tr key={row.year} className="hover:bg-white/5">
                  <td className="py-1.5 px-2.5 lux-text-muted">{row.year}</td>
                  <td className="py-1.5 px-2">
                    {formatCurrency(row.invested)}
                  </td>
                  <td className="py-1.5 px-2">
                    {formatCurrency(row.nominalBalance)}
                  </td>
                  <td className="py-1.5 px-2.5 text-right">
                    {formatCurrency(row.realBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
