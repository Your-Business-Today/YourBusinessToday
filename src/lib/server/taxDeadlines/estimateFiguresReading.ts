import {
	deadlinesEmailFields,
	deadlinesEmailLimits,
	estimateFigureLabels,
	type EstimateFigureName,
	type EstimateFigures
} from '$lib/data/taxCalculator/deadlinesEmailForm';

export type EstimateFiguresReading = { estimate: EstimateFigures | null } | { problem: string };

type AmountReading = { amount: number | null } | { problem: string };

const poundsAndPence = /^-?\d+(\.\d{1,2})?$/;

/** The estimate goes in only when the person ticked to include it, which is when the form sends a take-home. */
export function readEstimateFigures(valueOf: (fieldName: string) => string): EstimateFiguresReading {
	if (valueOf(deadlinesEmailFields.takeHome) === '') return { estimate: null };
	const takeHome = readAmount('takeHome', valueOf);
	const selfAssessmentBill = readAmount('selfAssessmentBill', valueOf);
	const paymentOnAccount = readAmount('paymentOnAccount', valueOf);
	const failedReading = [takeHome, selfAssessmentBill, paymentOnAccount].find((reading) => 'problem' in reading);
	if (failedReading && 'problem' in failedReading) return { problem: failedReading.problem };
	return {
		estimate: {
			takeHome: amountOf(takeHome) ?? 0,
			selfAssessmentBill: amountOf(selfAssessmentBill),
			paymentOnAccount: amountOf(paymentOnAccount)
		}
	};
}

function readAmount(figureName: EstimateFigureName, valueOf: (fieldName: string) => string): AmountReading {
	const text = valueOf(deadlinesEmailFields[figureName]);
	if (text === '') return { amount: null };
	const label = estimateFigureLabels[figureName];
	if (!poundsAndPence.test(text)) return { problem: `${label} must be an amount in pounds and pence.` };
	const amount = Number(text);
	if (Math.abs(amount) > deadlinesEmailLimits.largestAmount) {
		return { problem: `${label} must be no more than £${deadlinesEmailLimits.largestAmount.toLocaleString('en-GB')} either way.` };
	}
	return { amount };
}

function amountOf(reading: AmountReading): number | null {
	return 'amount' in reading ? reading.amount : null;
}
