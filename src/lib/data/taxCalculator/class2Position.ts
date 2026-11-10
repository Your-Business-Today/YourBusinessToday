import { selfAssessmentOutcomes, type SelfAssessmentBill } from './selfAssessmentBill';
import type { NationalInsuranceRules } from './taxRuleTypes';

export type Class2Position = 'creditedAutomatically' | 'belowSmallProfitsThreshold' | 'tradingLoss';
export const class2Positions = {
	creditedAutomatically: 'creditedAutomatically',
	belowSmallProfitsThreshold: 'belowSmallProfitsThreshold',
	tradingLoss: 'tradingLoss'
} as const satisfies Record<Class2Position, Class2Position>;

export function class2PositionFor(bill: SelfAssessmentBill, rules: NationalInsuranceRules): Class2Position {
	if (bill.outcome === selfAssessmentOutcomes.loss) return class2Positions.tradingLoss;
	if (bill.profit >= rules.smallProfitsThreshold) return 'creditedAutomatically';
	return 'belowSmallProfitsThreshold';
}
