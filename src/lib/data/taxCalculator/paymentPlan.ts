import { roundToPence } from '$lib/data/books/money';
import { selfAssessmentOutcomes, type SelfAssessmentBill } from './selfAssessmentBill';
import { averageDaysPerMonth, daysBetween, endOfDayOn } from './taxDates';

export type PaymentPlan = {
	amountDue: number;
	dueOn: string;
	isOverdue: boolean;
	daysRemaining: number;
	monthsRemaining: number;
	monthlySetAside: number;
	quarterlySetAside: number;
};

const monthsPerQuarter = 3;

const fewestMonthsToSpreadOver = 1;

export function planPayment(bill: SelfAssessmentBill, dueOn: string, today: Date): PaymentPlan | null {
	if (bill.outcome !== selfAssessmentOutcomes.taxDue || bill.balanceDue <= 0) return null;
	const daysRemaining = daysBetween(today, endOfDayOn(dueOn));
	const monthsRemaining = Math.round(daysRemaining / averageDaysPerMonth);
	const monthsToSpreadOver = Math.max(fewestMonthsToSpreadOver, monthsRemaining);
	const monthlySetAside = roundToPence(bill.balanceDue / monthsToSpreadOver);
	return {
		amountDue: bill.balanceDue,
		dueOn,
		isOverdue: daysRemaining < 0,
		daysRemaining: Math.max(1, Math.ceil(daysRemaining)),
		monthsRemaining,
		monthlySetAside,
		quarterlySetAside: roundToPence(monthlySetAside * monthsPerQuarter)
	};
}
