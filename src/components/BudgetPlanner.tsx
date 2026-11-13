import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/financeMath';
import { formatFixedWithCommas } from '../utils/mathEngine';

interface BudgetItem {
  id: string;
  name: string;
  amount: string;
}

interface BudgetPlannerProps {
  onDisplaySync: (expression: string, result: string) => void;
}

const BUDGET_STORAGE_KEY = 'lux_calc_budget_v1';

const DEFAULT_ITEMS: BudgetItem[] = [
  { id: 'housing', name: 'Housing & Rent', amount: '1650' },
  { id: 'utilities', name: 'Utilities & Internet', amount: '240' },
  { id: 'groceries', name: 'Groceries & Dining', amount: '620' },
  { id: 'transport', name: 'Transport & Fuel', amount: '310' },
  { id: 'savings', name: 'Savings & Investments', amount: '800' },
  { id: 'lifestyle', name: 'Lifestyle & Other', amount: '380' },
];

export function BudgetPlanner({ onDisplaySync }: BudgetPlannerProps) {
  const [monthlyIncome, setMonthlyIncome] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.income === 'string') return parsed.income;
      }
    } catch {
      // Ignore
    }
    return '5200';
  });

  const [items, setItems] = useState<BudgetItem[]>(() => {
    try {
      const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          return parsed.items;
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_ITEMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        BUDGET_STORAGE_KEY,
        JSON.stringify({ income: monthlyIncome, items })
      );
    } catch {
      // Ignore
    }
  }, [monthlyIncome, items]);

  const summary = useMemo(() => {
    const income = Math.max(0, parseFloat(monthlyIncome) || 0);
    const totalExpenses = items.reduce(
      (sum, it) => sum + Math.max(0, parseFloat(it.amount) || 0),
      0
    );
    const remaining = income - totalExpenses;
    const spentPct = income > 0 ? Math.min(100, (totalExpenses / income) * 100) : 0;
    const unallocatedPct = income > 0 ? (remaining / income) * 100 : 0;
    return { income, totalExpenses, remaining, spentPct, unallocatedPct };
  }, [monthlyIncome, items]);

  useEffect(() => {
    onDisplaySync(
      summary.remaining >= 0 ? 'Monthly Surplus' : 'Monthly Deficit',
      formatFixedWithCommas(summary.remaining)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  const updateItem = (id: string, field: 'name' | 'amount', value: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        name: 'New Expense',
        amount: '100',
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const inputClass =
    'w-full min-h-[40px] lux-input rounded-[10px] px-2.5 py-1.5 font-mono tabular-nums text-[13px]';

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b lux-border-subtle pb-2">
        <span className="text-[13px] font-semibold lux-text-bright">
          Budget Planner
        </span>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md btn-obsidian-key text-[11px] font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-medium lux-text-soft mb-1">
          Monthly Net Income ($)
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="max-h-[180px] overflow-y-auto gold-scroll space-y-1.5 pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1.35fr_0.9fr_auto] gap-1.5 items-center"
          >
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              aria-label="Expense category name"
              className="w-full min-h-[40px] lux-input rounded-[10px] px-2.5 py-1.5 text-[12px] font-medium"
            />
            <input
              type="number"
              inputMode="decimal"
              value={item.amount}
              onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
              aria-label={`${item.name} amount`}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              disabled={items.length <= 1}
              aria-label={`Remove ${item.name}`}
              className="min-h-[40px] min-w-[40px] rounded-[10px] btn-obsidian-key flex items-center justify-center disabled:opacity-35 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="obsidian-display-screen rounded-[14px] p-3.5 border lux-border-subtle space-y-2.5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[11px] lux-text-muted">Allocated</div>
            <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
              {formatCurrency(summary.totalExpenses)}
            </div>
          </div>
          <div>
            <div className="text-[11px] lux-text-muted">
              {summary.remaining >= 0 ? 'Remaining' : 'Over Budget'}
            </div>
            <div
              className={`text-[15px] font-bold font-mono tabular-nums ${
                summary.remaining >= 0 ? 'lux-text-bright' : 'text-amber-400'
              }`}
            >
              {formatCurrency(summary.remaining)}
            </div>
          </div>
          <div>
            <div className="text-[11px] lux-text-muted">Free Margin</div>
            <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
              {summary.unallocatedPct.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] lux-text-muted">
            <span>Income Allocated</span>
            <span className="font-mono lux-text-bright">
              {summary.spentPct.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#1e2026] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${summary.spentPct}%`,
                background: 'var(--lux-tab-active-grad)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
