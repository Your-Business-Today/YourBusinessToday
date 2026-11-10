import type { EstimateFigures } from './deadlinesEmailForm';
import { paymentsOnAccountFor } from './paymentsOnAccount';
import { selfAssessmentOutcomes } from './selfAssessmentBill';
import type { TakeHomeEstimate } from './takeHomeEstimate';

const penceDigits = 2;

/** The few figures the deadlines email carries when the person asks for their estimate in it. */
export function estimateFiguresFor(estimate: TakeHomeEstimate): EstimateFigures {
	const bill = estimate.selfAssessment;
	const isTaxDue = bill?.outcome === selfAssessmentOutcomes.taxDue;
	const paymentsOnAccount = bill ? paymentsOnAccountFor(bill, estimate.rules) : null;
	return {
		takeHome: estimate.takeHome,
		selfAssessmentBill: isTaxDue ? bill.balanceDue : null,
		paymentOnAccount: paymentsOnAccount?.eachPayment ?? null
	};
}

export function amountAsFieldValue(amount: number | null): string {
	return amount === null ? '' : amount.toFixed(penceDigits);
}
