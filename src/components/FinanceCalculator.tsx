import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  calculateLoanAmortization,
  calculateCompoundInterest,
  calculateNPV,
  calculateIRR,
  formatCurrency,
} from '../utils/financeMath';
import { formatFixedWithCommas } from '../utils/mathEngine';

export type FinanceTab = 'loan' | 'compound' | 'npv' | 'irr' | 'tip';

interface FinanceCalculatorProps {
  onDisplaySync: (expression: string, result: string) => void;
}

export function FinanceCalculator({ onDisplaySync }: FinanceCalculatorProps) {
  const [tab, setTab] = useState<FinanceTab>('loan');

  // 1. Loan Amortization state
  const [loanPrincipal, setLoanPrincipal] = useState('250000');
  const [loanRate, setLoanRate] = useState('6.25');
  const [loanYears, setLoanYears] = useState('30');
  const [showSchedule, setShowSchedule] = useState(false);

  // 2. Compound Interest state
  const [compPrincipal, setCompPrincipal] = useState('10000');
  const [compMonthly, setCompMonthly] = useState('250');
  const [compRate, setCompRate] = useState('7.5');
  const [compYears, setCompYears] = useState('15');
  const [compFreq, setCompFreq] = useState('12');
  const [showCompTable, setShowCompTable] = useState(false);

  // 3. NPV & 4. IRR Cash Flows
  const [discountRate, setDiscountRate] = useState('8.5');
  const [cashFlows, setCashFlows] = useState<string[]>([
    '-50000',
    '15000',
    '18000',
    '22000',
    '25000',
  ]);

  // 5. Tip Splitter state
  const [billAmount, setBillAmount] = useState('124.50');
  const [tipPercent, setTipPercent] = useState('18');
  const [splitPeople, setSplitPeople] = useState('4');
  const [roundUpPerPerson, setRoundUpPerPerson] = useState(false);

  // Computations
  const loanResult = useMemo(() => {
    const p = parseFloat(loanPrincipal) || 0;
    const r = parseFloat(loanRate) || 0;
    const months = Math.round((parseFloat(loanYears) || 0) * 12);
    return calculateLoanAmortization(p, r, months);
  }, [loanPrincipal, loanRate, loanYears]);

  const compoundResult = useMemo(() => {
    const p = parseFloat(compPrincipal) || 0;
    const m = parseFloat(compMonthly) || 0;
    const r = parseFloat(compRate) || 0;
    const y = parseFloat(compYears) || 0;
    const f = parseInt(compFreq, 10) || 12;
    return calculateCompoundInterest(p, m, r, y, f);
  }, [compPrincipal, compMonthly, compRate, compYears, compFreq]);

  const numericCashFlows = useMemo(
    () => cashFlows.map((cf) => parseFloat(cf) || 0),
    [cashFlows]
  );

  const npvResult = useMemo(
    () => calculateNPV(parseFloat(discountRate) || 0, numericCashFlows),
    [discountRate, numericCashFlows]
  );

  const irrResult = useMemo(
    () => calculateIRR(numericCashFlows),
    [numericCashFlows]
  );

  const tipResult = useMemo(() => {
    const bill = Math.max(0, parseFloat(billAmount) || 0);
    const pct = Math.max(0, parseFloat(tipPercent) || 0);
    const people = Math.max(1, Math.round(parseFloat(splitPeople) || 1));
    const tipAmt = (bill * pct) / 100;
    const rawTotal = bill + tipAmt;
    let perPerson = rawTotal / people;
    if (roundUpPerPerson) {
      perPerson = Math.ceil(perPerson);
    }
    const finalTotal = roundUpPerPerson ? perPerson * people : rawTotal;
    const effectiveTip = finalTotal - bill;
    return {
      tipAmount: effectiveTip,
      totalBill: finalTotal,
      perPerson,
      tipPerPerson: effectiveTip / people,
    };
  }, [billAmount, tipPercent, splitPeople, roundUpPerPerson]);

  // Sync top OLED display with active finance tab result
  useEffect(() => {
    if (tab === 'loan') {
      onDisplaySync(
        'Monthly Payment',
        formatFixedWithCommas(loanResult.monthlyPayment)
      );
    } else if (tab === 'compound') {
      onDisplaySync(
        'Future Balance',
        formatFixedWithCommas(compoundResult.finalBalance)
      );
    } else if (tab === 'npv') {
      onDisplaySync(
        `NPV @ ${discountRate || '0'}%`,
        formatFixedWithCommas(npvResult.npv)
      );
    } else if (tab === 'irr') {
      onDisplaySync(
        'Internal Rate of Return',
        irrResult !== null ? `${formatFixedWithCommas(irrResult)}%` : 'N/A'
      );
    } else if (tab === 'tip') {
      onDisplaySync(
        `Per Person (${splitPeople || 1})`,
        formatFixedWithCommas(tipResult.perPerson)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, loanResult, compoundResult, npvResult, irrResult, tipResult]);

  const inputClass =
    'w-full min-h-[42px] lux-input rounded-[10px] px-3 py-1.5 font-mono tabular-nums text-[14px]';
  const labelClass = 'block text-[11px] font-medium lux-text-soft mb-1';

  const tabs: { id: FinanceTab; label: string }[] = [
    { id: 'loan', label: 'Loan' },
    { id: 'compound', label: 'Compound' },
    { id: 'npv', label: 'NPV' },
    { id: 'irr', label: 'IRR' },
    { id: 'tip', label: 'Tip Split' },
  ];

  const updateCashFlow = (idx: number, val: string) => {
    setCashFlows((prev) => prev.map((v, i) => (i === idx ? val : v)));
  };

  const addCashFlow = () => {
    setCashFlows((prev) => [...prev, '10000']);
  };

  const removeCashFlow = (idx: number) => {
    if (cashFlows.length <= 2) return;
    setCashFlows((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-3.5 space-y-3">
      {/* Sub-navigation */}
      <div className="grid grid-cols-5 gap-1.5 bg-[#121316]/90 p-1 rounded-[12px] border lux-border-subtle">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-[38px] rounded-[9px] text-[11px] sm:text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              tab === t.id
                ? 'btn-gold-key'
                : 'lux-text-soft hover:lux-text-bright'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LOAN AMORTIZATION */}
      {tab === 'loan' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelClass}>Principal ($)</label>
              <input
                type="number"
                inputMode="decimal"
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Rate (%/yr)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.05"
                value={loanRate}
                onChange={(e) => setLoanRate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Term (Yrs)</label>
              <input
                type="number"
                inputMode="numeric"
                value={loanYears}
                onChange={(e) => setLoanYears(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="obsidian-display-screen rounded-[14px] p-3 border lux-border-subtle grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[11px] lux-text-muted">Monthly</div>
              <div className="text-[15px] font-bold font-mono tabular-nums lux-text-bright">
                {formatCurrency(loanResult.monthlyPayment)}
              </div>
            </div>
            <div>
              <div className="text-[11px] lux-text-muted">Total Interest</div>
              <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
                {formatCurrency(loanResult.totalInterest)}
              </div>
            </div>
            <div>
              <div className="text-[11px] lux-text-muted">Total Paid</div>
              <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
                {formatCurrency(loanResult.totalPayment)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSchedule((s) => !s)}
            className="w-full min-h-[42px] rounded-[12px] btn-obsidian-key text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>
              {showSchedule
                ? 'Hide Amortization Schedule'
                : `View Amortization Schedule (${loanResult.schedule.length} mo)`}
            </span>
            {showSchedule ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showSchedule && loanResult.schedule.length > 0 && (
            <div className="max-h-[190px] overflow-y-auto gold-scroll rounded-[12px] bg-[#121316] border lux-border-subtle">
              <table className="w-full text-[11px] font-mono tabular-nums text-left">
                <thead className="sticky top-0 bg-[#181a1f] lux-text-bright border-b lux-border-subtle">
                  <tr>
                    <th className="py-2 px-2.5">Mo</th>
                    <th className="py-2 px-2">Principal</th>
                    <th className="py-2 px-2">Interest</th>
                    <th className="py-2 px-2.5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 lux-text-soft">
                  {loanResult.schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-white/5">
                      <td className="py-1.5 px-2.5 lux-text-muted">
                        {row.month}
                      </td>
                      <td className="py-1.5 px-2">
                        {formatCurrency(row.principal)}
                      </td>
                      <td className="py-1.5 px-2">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="py-1.5 px-2.5 text-right">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* COMPOUND INTEREST */}
      {tab === 'compound' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Initial Principal ($)</label>
              <input
                type="number"
                inputMode="decimal"
                value={compPrincipal}
                onChange={(e) => setCompPrincipal(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Monthly Deposit ($)</label>
              <input
                type="number"
                inputMode="decimal"
                value={compMonthly}
                onChange={(e) => setCompMonthly(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Annual Rate (%)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={compRate}
                onChange={(e) => setCompRate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className={labelClass}>Years</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={compYears}
                  onChange={(e) => setCompYears(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Comp/Yr</label>
                <select
                  value={compFreq}
                  onChange={(e) => setCompFreq(e.target.value)}
                  className={inputClass}
                >
                  <option value="365">Daily</option>
                  <option value="12">Monthly</option>
                  <option value="4">Quarterly</option>
                  <option value="1">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="obsidian-display-screen rounded-[14px] p-3 border lux-border-subtle grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[11px] lux-text-muted">Final Balance</div>
              <div className="text-[14px] font-bold font-mono tabular-nums lux-text-bright">
                {formatCurrency(compoundResult.finalBalance)}
              </div>
            </div>
            <div>
              <div className="text-[11px] lux-text-muted">Contributed</div>
              <div className="text-[13px] font-semibold font-mono tabular-nums lux-text-accent">
                {formatCurrency(compoundResult.totalContributed)}
              </div>
            </div>
            <div>
              <div className="text-[11px] lux-text-muted">Interest</div>
              <div className="text-[13px] font-semibold font-mono tabular-nums lux-text-accent">
                {formatCurrency(compoundResult.totalInterest)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCompTable((s) => !s)}
            className="w-full min-h-[42px] rounded-[12px] btn-obsidian-key text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>
              {showCompTable
                ? 'Hide Yearly Growth'
                : 'View Yearly Growth Breakdown'}
            </span>
            {showCompTable ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showCompTable && compoundResult.yearlyRows.length > 0 && (
            <div className="max-h-[175px] overflow-y-auto gold-scroll rounded-[12px] bg-[#121316] border lux-border-subtle">
              <table className="w-full text-[11px] font-mono tabular-nums text-left">
                <thead className="sticky top-0 bg-[#181a1f] lux-text-bright border-b lux-border-subtle">
                  <tr>
                    <th className="py-2 px-2.5">Yr</th>
                    <th className="py-2 px-2">Deposits</th>
                    <th className="py-2 px-2">Interest</th>
                    <th className="py-2 px-2.5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 lux-text-soft">
                  {compoundResult.yearlyRows.map((row) => (
                    <tr key={row.year} className="hover:bg-white/5">
                      <td className="py-1.5 px-2.5 lux-text-muted">
                        {row.year}
                      </td>
                      <td className="py-1.5 px-2">
                        {formatCurrency(row.contributions)}
                      </td>
                      <td className="py-1.5 px-2">
                        {formatCurrency(row.interestEarned)}
                      </td>
                      <td className="py-1.5 px-2.5 text-right">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* NPV & IRR */}
      {(tab === 'npv' || tab === 'irr') && (
        <div className="space-y-2.5">
          {tab === 'npv' && (
            <div>
              <label className={labelClass}>Discount Rate (% per period)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.25"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium lux-text-soft">
                Cash Flows (Period 0 = Initial Investment)
              </span>
              <button
                type="button"
                onClick={addCashFlow}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md btn-obsidian-key text-[11px] font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period</span>
              </button>
            </div>
            <div className="max-h-[168px] overflow-y-auto gold-scroll space-y-1.5 pr-1">
              {cashFlows.map((cf, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-11 shrink-0 text-[11px] font-mono lux-text-muted">
                    CF{idx}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={cf}
                    onChange={(e) => updateCashFlow(idx, e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeCashFlow(idx)}
                    disabled={cashFlows.length <= 2}
                    aria-label={`Remove period ${idx}`}
                    className="min-h-[40px] min-w-[40px] rounded-[10px] btn-obsidian-key flex items-center justify-center disabled:opacity-35 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {tab === 'npv' ? (
            <div className="obsidian-display-screen rounded-[14px] p-3 border lux-border-subtle grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-[11px] lux-text-muted">
                  Net Present Value
                </div>
                <div className="text-[16px] font-bold font-mono tabular-nums lux-text-bright">
                  {formatCurrency(npvResult.npv)}
                </div>
              </div>
              <div>
                <div className="text-[11px] lux-text-muted">
                  Profitability Index
                </div>
                <div className="text-[16px] font-bold font-mono tabular-nums lux-text-accent">
                  {npvResult.profitabilityIndex.toFixed(3)}x
                </div>
              </div>
            </div>
          ) : (
            <div className="obsidian-display-screen rounded-[14px] p-3.5 border lux-border-subtle text-center">
              <div className="text-[11px] lux-text-muted">
                Internal Rate of Return (IRR)
              </div>
              <div className="text-[20px] font-bold font-mono tabular-nums lux-text-bright mt-0.5">
                {irrResult !== null
                  ? `${irrResult.toFixed(2)}%`
                  : 'Requires + and - cash flows'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TIP SPLITTER */}
      {tab === 'tip' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Bill Amount ($)</label>
              <input
                type="number"
                inputMode="decimal"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Split Between (People)</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={splitPeople}
                onChange={(e) => setSplitPeople(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={labelClass}>Tip Percentage</span>
              <span className="text-[12px] font-mono lux-text-bright">
                {tipPercent}%
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {['10', '15', '18', '20', '25'].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTipPercent(pct)}
                  className={`min-h-[40px] rounded-[10px] text-[13px] font-bold cursor-pointer ${
                    tipPercent === pct ? 'btn-gold-key' : 'btn-obsidian-key'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <input
              type="number"
              inputMode="decimal"
              value={tipPercent}
              onChange={(e) => setTipPercent(e.target.value)}
              aria-label="Custom tip percentage"
              placeholder="Custom %"
              className={inputClass}
            />
          </div>

          <label className="flex items-center justify-between px-3 py-2.5 rounded-[12px] bg-[#16171a] border lux-border-subtle cursor-pointer">
            <span className="text-[13px] lux-text-soft font-medium">
              Round up per-person share
            </span>
            <input
              type="checkbox"
              checked={roundUpPerPerson}
              onChange={(e) => setRoundUpPerPerson(e.target.checked)}
              className="w-4 h-4"
            />
          </label>

          <div className="obsidian-display-screen rounded-[14px] p-3.5 border lux-border-subtle grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[11px] lux-text-muted">Per Person</div>
              <div className="text-[16px] font-bold font-mono tabular-nums lux-text-bright">
                {formatCurrency(tipResult.perPerson)}
              </div>
            </div>
            <div>
              <div className="text-[11px] lux-text-muted">Tip Total</div>
              <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
                {formatCurrency(tipResult.tipAmount)}
              </div>
            </div>
            <div>
              <div className="text-[11px] lux-text-muted">Grand Total</div>
              <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
                {formatCurrency(tipResult.totalBill)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
