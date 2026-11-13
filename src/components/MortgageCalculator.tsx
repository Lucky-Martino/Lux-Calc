import { useEffect, useMemo, useState } from 'react';
import { calculateMortgage, formatCurrency } from '../utils/financeMath';
import { formatFixedWithCommas } from '../utils/mathEngine';

interface MortgageCalculatorProps {
  onDisplaySync: (expression: string, result: string) => void;
}

export function MortgageCalculator({
  onDisplaySync,
}: MortgageCalculatorProps) {
  const [homePrice, setHomePrice] = useState('420000');
  const [downPayment, setDownPayment] = useState('84000');
  const [interestRate, setInterestRate] = useState('6.35');
  const [termYears, setTermYears] = useState('30');
  const [propertyTaxYr, setPropertyTaxYr] = useState('4800');
  const [insuranceYr, setInsuranceYr] = useState('1500');
  const [hoaMonthly, setHoaMonthly] = useState('120');

  const result = useMemo(() => {
    return calculateMortgage(
      parseFloat(homePrice) || 0,
      parseFloat(downPayment) || 0,
      parseFloat(interestRate) || 0,
      parseFloat(termYears) || 30,
      parseFloat(propertyTaxYr) || 0,
      parseFloat(insuranceYr) || 0,
      parseFloat(hoaMonthly) || 0
    );
  }, [
    homePrice,
    downPayment,
    interestRate,
    termYears,
    propertyTaxYr,
    insuranceYr,
    hoaMonthly,
  ]);

  useEffect(() => {
    onDisplaySync(
      `Monthly Mortgage (PITI · ${termYears || 30}yr)`,
      formatFixedWithCommas(result.totalMonthlyPITI)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, termYears]);

  const inputClass =
    'w-full min-h-[42px] lux-input rounded-[10px] px-3 py-1.5 font-mono tabular-nums text-[14px]';
  const labelClass = 'block text-[11px] font-medium lux-text-soft mb-1';

  const downPct =
    (parseFloat(homePrice) || 0) > 0
      ? (((parseFloat(downPayment) || 0) / (parseFloat(homePrice) || 1)) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b lux-border-subtle pb-2">
        <span className="text-[13px] font-semibold lux-text-bright">
          Mortgage Calculator
        </span>
        <span className="text-[11px] font-mono lux-text-muted">
          Down {downPct}% · LTV {result.ltvPercent.toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Home Price ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Down Payment ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Interest Rate (%)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.05"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Loan Term</label>
          <select
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            className="w-full min-h-[42px] lux-select-tray rounded-[10px] px-3 py-1.5 font-mono text-[13px] cursor-pointer"
          >
            <option value="10">10 Years</option>
            <option value="15">15 Years</option>
            <option value="20">20 Years</option>
            <option value="30">30 Years</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={labelClass}>Prop Tax /yr</label>
          <input
            type="number"
            inputMode="decimal"
            value={propertyTaxYr}
            onChange={(e) => setPropertyTaxYr(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Insurance /yr</label>
          <input
            type="number"
            inputMode="decimal"
            value={insuranceYr}
            onChange={(e) => setInsuranceYr(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>HOA /mo</label>
          <input
            type="number"
            inputMode="decimal"
            value={hoaMonthly}
            onChange={(e) => setHoaMonthly(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="obsidian-display-screen rounded-[14px] p-3.5 border lux-border-subtle space-y-2.5">
        <div className="text-center">
          <div className="text-[11px] lux-text-muted">
            Estimated Monthly Payment (PITI)
          </div>
          <div className="text-[20px] font-bold font-mono tabular-nums lux-text-bright mt-0.5">
            {formatCurrency(result.totalMonthlyPITI)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t lux-border-subtle text-center">
          <div>
            <div className="text-[10px] lux-text-muted">P & I</div>
            <div className="text-[13px] font-semibold font-mono tabular-nums lux-text-accent">
              {formatCurrency(result.principalAndInterest)}
            </div>
          </div>
          <div>
            <div className="text-[10px] lux-text-muted">Tax & Ins</div>
            <div className="text-[13px] font-semibold font-mono tabular-nums lux-text-accent">
              {formatCurrency(
                result.monthlyPropertyTax + result.monthlyInsurance
              )}
            </div>
          </div>
          <div>
            <div className="text-[10px] lux-text-muted">Loan Amt</div>
            <div className="text-[13px] font-semibold font-mono tabular-nums lux-text-soft">
              {formatCurrency(result.loanAmount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
