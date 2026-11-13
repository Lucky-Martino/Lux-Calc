import { useEffect, useMemo, useState } from 'react';
import { calculateSavings, formatCurrency } from '../utils/financeMath';
import { formatFixedWithCommas } from '../utils/mathEngine';

interface SavingsCalculatorProps {
  onDisplaySync: (expression: string, result: string) => void;
}

export function SavingsCalculator({ onDisplaySync }: SavingsCalculatorProps) {
  const [initialDeposit, setInitialDeposit] = useState('5000');
  const [monthlyDeposit, setMonthlyDeposit] = useState('400');
  const [apy, setApy] = useState('4.75');
  const [years, setYears] = useState('5');
  const [goalAmount, setGoalAmount] = useState('30000');

  const result = useMemo(() => {
    return calculateSavings(
      parseFloat(initialDeposit) || 0,
      parseFloat(monthlyDeposit) || 0,
      parseFloat(apy) || 0,
      parseFloat(years) || 0,
      parseFloat(goalAmount) || 0
    );
  }, [initialDeposit, monthlyDeposit, apy, years, goalAmount]);

  useEffect(() => {
    onDisplaySync(
      `Savings (${years || 0} yr @ ${apy || 0}% APY)`,
      formatFixedWithCommas(result.finalBalance)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, years, apy]);

  const inputClass =
    'w-full min-h-[42px] lux-input rounded-[10px] px-3 py-1.5 font-mono tabular-nums text-[14px]';
  const labelClass = 'block text-[11px] font-medium lux-text-soft mb-1';

  const goalNum = parseFloat(goalAmount) || 0;
  const progressPct =
    goalNum > 0
      ? Math.min(100, Math.round((result.finalBalance / goalNum) * 100))
      : 0;

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b lux-border-subtle pb-2">
        <span className="text-[13px] font-semibold lux-text-bright">
          Savings Calculator
        </span>
        <span className="text-[11px] font-mono lux-text-muted">APY Compound</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className={labelClass}>Initial Deposit ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={initialDeposit}
            onChange={(e) => setInitialDeposit(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Monthly Addition ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Annual APY (%)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.05"
            value={apy}
            onChange={(e) => setApy(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Time Period (Years)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Savings Goal Target ($)</label>
        <input
          type="number"
          inputMode="decimal"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="obsidian-display-screen rounded-[14px] p-3.5 border lux-border-subtle space-y-2.5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[11px] lux-text-muted">Total Saved</div>
            <div className="text-[15px] font-bold font-mono tabular-nums lux-text-bright">
              {formatCurrency(result.finalBalance)}
            </div>
          </div>
          <div>
            <div className="text-[11px] lux-text-muted">Deposits</div>
            <div className="text-[13px] font-semibold font-mono tabular-nums lux-text-accent">
              {formatCurrency(result.totalDeposits)}
            </div>
          </div>
          <div>
            <div className="text-[11px] lux-text-muted">Interest</div>
            <div className="text-[13px] font-semibold font-mono tabular-nums lux-text-accent">
              {formatCurrency(result.totalInterest)}
            </div>
          </div>
        </div>

        {goalNum > 0 && (
          <div className="pt-2 border-t lux-border-subtle space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="lux-text-muted">
                Goal Progress ({progressPct}%)
              </span>
              <span className="font-mono lux-text-bright">
                {result.monthsToGoal !== null
                  ? `Goal reached in ${result.monthsToGoal} mo`
                  : `${formatCurrency(Math.max(0, goalNum - result.finalBalance))} remaining`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#1e2026] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progressPct}%`,
                  background: 'var(--lux-tab-active-grad)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
