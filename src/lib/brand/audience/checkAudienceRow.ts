import { ageBands, genders, isAgeBand, isGender } from './audienceBands';
import { audienceFigures, type AudienceCounts, type AudienceRow } from './audienceRow';
import { PerformanceLimits } from '../performance/performanceLimits';
import { toPence } from '$lib/data/books/money';
import { validateCount } from '../performance/validateCount';
import { validateMoney } from '$lib/data/books/moneyColumn';

export type AudienceRowCheck = { row: AudienceRow } | { problem: string };

type Input = Record<string, unknown>;

/** One band of a campaign's audience as given, every value checked against its column, or the first reason it cannot be kept. */
export function checkAudienceRow(input: Input): AudienceRowCheck {
	const ageBand = typeof input.ageBand === 'string' ? input.ageBand.trim() : '';
	if (!isAgeBand(ageBand)) return { problem: `ageBand is one of ${ageBands.join(', ')}; ${ageBand || 'nothing'} was given` };
	const gender = typeof input.gender === 'string' ? input.gender.trim() : '';
	if (!isGender(gender)) return { problem: `gender is one of ${genders.join(', ')}; ${gender || 'nothing'} was given` };
	const counts = countsOf(input);
	if (typeof counts === 'string') return { problem: counts };
	return { row: { ageBand, gender, ...counts } };
}

function countsOf(input: Input): AudienceCounts | string {
	const counts = {} as AudienceCounts;
	for (const figure of audienceFigures) {
		const count = validateCount(figure, input[figure] ?? 0, PerformanceLimits.largestCount);
		if (typeof count === 'string') return count;
		counts[figure] = count;
	}
	const pounds = validateMoney('spendPounds', input.spendPounds ?? 0);
	if (typeof pounds === 'string') return pounds.replace(/\.$/, '');
	return { ...counts, spendPence: toPence(pounds) };
}
