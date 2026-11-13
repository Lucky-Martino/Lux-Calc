export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationRow[];
}

export function calculateLoanAmortization(
  principal: number,
  annualRatePercent: number,
  totalMonths: number
): LoanResult {
  if (principal <= 0 || totalMonths <= 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0, schedule: [] };
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  let monthlyPayment = 0;

  if (monthlyRate === 0) {
    monthlyPayment = principal / totalMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    monthlyPayment = (principal * (monthlyRate * factor)) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let month = 1; month <= Math.min(totalMonths, 600); month++) {
    const interest = balance * monthlyRate;
    let principalPaid = monthlyPayment - interest;
    if (month === totalMonths || principalPaid > balance) {
      principalPaid = balance;
    }
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;

    schedule.push({
      month,
      payment: principalPaid + interest,
      principal: principalPaid,
      interest,
      balance,
    });
  }

  return {
    monthlyPayment,
    totalPayment: principal + totalInterest,
    totalInterest,
    schedule,
  };
}

export interface CompoundInterestRow {
  year: number;
  contributions: number;
  interestEarned: number;
  balance: number;
}

export interface CompoundInterestResult {
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
  yearlyRows: CompoundInterestRow[];
}

export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualRatePercent: number,
  years: number,
  compoundsPerYear: number
): CompoundInterestResult {
  if (years <= 0) {
    return {
      finalBalance: principal,
      totalContributed: principal,
      totalInterest: 0,
      yearlyRows: [],
    };
  }

  const r = annualRatePercent / 100;
  const totalMonths = Math.round(years * 12);
  let balance = principal;
  let totalContributed = principal;
  const yearlyRows: CompoundInterestRow[] = [];

  // Simulate monthly steps with effective monthly compounding rate derived from compoundsPerYear
  const effectiveAnnualRate = Math.pow(1 + r / compoundsPerYear, compoundsPerYear) - 1;
  const monthlyEffectiveRate = Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1;

  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + monthlyEffectiveRate) + monthlyContribution;
    totalContributed += monthlyContribution;

    if (m % 12 === 0 || m === totalMonths) {
      yearlyRows.push({
        year: Number((m / 12).toFixed(1)),
        contributions: totalContributed,
        interestEarned: balance - totalContributed,
        balance,
      });
    }
  }

  return {
    finalBalance: balance,
    totalContributed,
    totalInterest: balance - totalContributed,
    yearlyRows,
  };
}

export interface NpvResult {
  npv: number;
  pvInflows: number;
  profitabilityIndex: number;
}

export function calculateNPV(discountRatePercent: number, cashFlows: number[]): NpvResult {
  const r = discountRatePercent / 100;
  let npv = 0;
  let pvInflows = 0;

  for (let t = 0; t < cashFlows.length; t++) {
    const cf = cashFlows[t];
    const pv = cf / Math.pow(1 + r, t);
    npv += pv;
    if (t > 0) pvInflows += pv;
  }

  const initialOutlay = cashFlows[0] < 0 ? Math.abs(cashFlows[0]) : 0;
  const profitabilityIndex = initialOutlay > 0 ? pvInflows / initialOutlay : 0;

  return { npv, pvInflows, profitabilityIndex };
}

export function calculateIRR(cashFlows: number[]): number | null {
  if (cashFlows.length < 2) return null;
  const hasPos = cashFlows.some((v) => v > 0);
  const hasNeg = cashFlows.some((v) => v < 0);
  if (!hasPos || !hasNeg) return null;

  const npvAt = (rate: number) =>
    cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);

  const npvDerivAt = (rate: number) =>
    cashFlows.reduce((acc, cf, t) => (t === 0 ? acc : acc - (t * cf) / Math.pow(1 + rate, t + 1)), 0);

  // Try Newton-Raphson from a few starting guesses
  for (const initialGuess of [0.1, 0.25, 0.0, -0.2, 0.5]) {
    let rate = initialGuess;
    for (let iter = 0; iter < 60; iter++) {
      if (rate <= -0.9999) break;
      const val = npvAt(rate);
      if (Math.abs(val) < 1e-7) {
        return rate * 100;
      }
      const d = npvDerivAt(rate);
      if (Math.abs(d) < 1e-12) break;
      rate = rate - val / d;
    }
  }

  // Fallback: bracketed bisection on [-0.99, 10.0]
  let low = -0.99;
  let high = 10.0;
  let fLow = npvAt(low);
  let fHigh = npvAt(high);

  if (fLow * fHigh > 0) return null;

  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    const fMid = npvAt(mid);
    if (Math.abs(fMid) < 1e-7) return mid * 100;
    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return ((low + high) / 2) * 100;
}

export function formatCurrency(value: number, currencySymbol = '$'): string {
  if (!Number.isFinite(value)) return `${currencySymbol}0.00`;
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  return `${sign}${currencySymbol}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface SavingsResult {
  finalBalance: number;
  totalDeposits: number;
  totalInterest: number;
  monthsToGoal: number | null;
}

export function calculateSavings(
  initialDeposit: number,
  monthlyDeposit: number,
  apyPercent: number,
  years: number,
  goalAmount: number
): SavingsResult {
  const totalMonths = Math.max(0, Math.round(years * 12));
  const monthlyRate = Math.pow(1 + Math.max(0, apyPercent) / 100, 1 / 12) - 1;
  let balance = Math.max(0, initialDeposit);
  let totalDeposits = balance;
  let monthsToGoal: number | null = goalAmount > 0 && balance >= goalAmount ? 0 : null;

  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + monthlyRate) + Math.max(0, monthlyDeposit);
    totalDeposits += Math.max(0, monthlyDeposit);
    if (monthsToGoal === null && goalAmount > 0 && balance >= goalAmount) {
      monthsToGoal = m;
    }
  }

  return {
    finalBalance: balance,
    totalDeposits,
    totalInterest: Math.max(0, balance - totalDeposits),
    monthsToGoal,
  };
}

export interface InvestmentYearRow {
  year: number;
  invested: number;
  nominalBalance: number;
  realBalance: number;
}

export interface InvestmentResult {
  nominalBalance: number;
  realBalance: number;
  totalInvested: number;
  totalReturn: number;
  yearlyRows: InvestmentYearRow[];
}

export function calculateInvestment(
  startingCapital: number,
  monthlyContribution: number,
  annualReturnPercent: number,
  annualInflationPercent: number,
  years: number
): InvestmentResult {
  const totalYears = Math.max(1, Math.min(60, Math.round(years)));
  const monthlyReturn = Math.pow(1 + annualReturnPercent / 100, 1 / 12) - 1;
  const infRate = Math.max(0, annualInflationPercent) / 100;

  let balance = Math.max(0, startingCapital);
  let totalInvested = balance;
  const yearlyRows: InvestmentYearRow[] = [];

  for (let y = 1; y <= totalYears; y++) {
    for (let m = 1; m <= 12; m++) {
      balance = balance * (1 + monthlyReturn) + Math.max(0, monthlyContribution);
      totalInvested += Math.max(0, monthlyContribution);
    }
    const realBalance = balance / Math.pow(1 + infRate, y);
    yearlyRows.push({
      year: y,
      invested: totalInvested,
      nominalBalance: balance,
      realBalance,
    });
  }

  const finalReal = balance / Math.pow(1 + infRate, totalYears);
  return {
    nominalBalance: balance,
    realBalance: finalReal,
    totalInvested,
    totalReturn: balance - totalInvested,
    yearlyRows,
  };
}

export interface MortgageResult {
  loanAmount: number;
  ltvPercent: number;
  principalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  totalMonthlyPITI: number;
  totalInterestOverLoan: number;
  totalLoanCost: number;
}

export function calculateMortgage(
  homePrice: number,
  downPayment: number,
  annualRatePercent: number,
  termYears: number,
  annualPropertyTax: number,
  annualInsurance: number,
  monthlyHoa: number
): MortgageResult {
  const price = Math.max(0, homePrice);
  const down = Math.min(price, Math.max(0, downPayment));
  const loanAmount = Math.max(0, price - down);
  const ltvPercent = price > 0 ? (loanAmount / price) * 100 : 0;

  const loan = calculateLoanAmortization(
    loanAmount,
    Math.max(0, annualRatePercent),
    Math.max(1, Math.round(termYears * 12))
  );

  const monthlyPropertyTax = Math.max(0, annualPropertyTax) / 12;
  const monthlyInsurance = Math.max(0, annualInsurance) / 12;
  const hoa = Math.max(0, monthlyHoa);

  return {
    loanAmount,
    ltvPercent,
    principalAndInterest: loan.monthlyPayment,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyHoa: hoa,
    totalMonthlyPITI:
      loan.monthlyPayment + monthlyPropertyTax + monthlyInsurance + hoa,
    totalInterestOverLoan: loan.totalInterest,
    totalLoanCost: loan.totalPayment,
  };
}
