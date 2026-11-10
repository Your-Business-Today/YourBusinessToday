import { roundToPence } from '$lib/data/books/money';
import { selfAssessmentOutcomes, type SelfAssessmentBill } from './selfAssessmentBill';
import { paymentsOnAccountRules } from './sharedRules';
import type { TaxYearRules } from './taxRuleTypes';

export type PaymentsOnAccount = {
	eachPayment: number;
	firstDueOn: string;
	secondDueOn: string;
};

const numberOfPaymentsOnAccount = 2;

export function paymentsOnAccountFor(bill: SelfAssessmentBill, rules: TaxYearRules): PaymentsOnAccount | null {
	const relevantAmount = roundToPence(bill.incomeTax + bill.class4 - bill.cisDeductions);
	if (bill.outcome !== selfAssessmentOutcomes.taxDue) return null;
	if (relevantAmount < paymentsOnAccountRules.smallestBillThatNeedsThem) return null;
	if (isMostlyCollectedAtSource(bill)) return null;
	return {
		eachPayment: roundToPence(relevantAmount / numberOfPaymentsOnAccount),
		firstDueOn: rules.balancingPaymentDueOn,
		secondDueOn: rules.secondPaymentOnAccountDueOn
	};
}

function isMostlyCollectedAtSource(bill: SelfAssessmentBill): boolean {
	const exemptingAmount = roundToPence(
		bill.incomeTaxAndClass4 * paymentsOnAccountRules.shareCollectedAtSourceThatExempts
	);
	return bill.taxCollectedAtSource >= exemptingAmount;
}
