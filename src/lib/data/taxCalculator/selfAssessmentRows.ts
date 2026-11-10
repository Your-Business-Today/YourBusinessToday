import type { BreakdownRow } from './breakdownRow';
import { line, total } from './breakdownRow';
import type { SelfAssessmentBill } from './selfAssessmentBill';
import { deducted, formatMoney } from './taxCalculatorFormatting';

export function selfAssessmentRows(bill: SelfAssessmentBill, hasPayroll: boolean): BreakdownRow[] {
	const optionalRow = (label: string, amount: number) => (amount > 0 ? [line(label, formatMoney(amount))] : []);
	const balanceLabel = bill.balanceDue < 0 ? 'Refund due from HMRC' : 'Balance due to HMRC';
	return [
		line(hasPayroll ? 'Income tax not already taken through payroll' : 'Income tax', formatMoney(bill.incomeTax)),
		...optionalRow('Class 4 National Insurance', bill.class4),
		...optionalRow('Student loan', bill.studentLoan),
		...(bill.cisDeductions > 0 ? [line('Less: CIS already deducted', deducted(bill.cisDeductions))] : []),
		total(balanceLabel, formatMoney(Math.abs(bill.balanceDue)))
	];
}
