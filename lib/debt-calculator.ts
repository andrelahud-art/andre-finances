import { addMonths } from 'date-fns';

export interface DebtScheduleRow {
  n: number;
  dueDate: Date;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  balance: number;
}

export function buildFrenchSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  start: Date
): { payment: number; rows: DebtScheduleRow[] } {
  const r = annualRate / 12 / 100; // Convert to monthly decimal
  const payment = principal * (r / (1 - Math.pow(1 + r, -termMonths)));
  const rows: DebtScheduleRow[] = [];
  let balance = principal;

  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * r;
    const principalDue = payment - interest;
    balance = Math.max(0, balance - principalDue);
    rows.push({
      n: i,
      dueDate: addMonths(start, i),
      principalDue: Math.round(principalDue * 100) / 100,
      interestDue: Math.round(interest * 100) / 100,
      totalDue: Math.round(payment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return {
    payment: Math.round(payment * 100) / 100,
    rows,
  };
}
