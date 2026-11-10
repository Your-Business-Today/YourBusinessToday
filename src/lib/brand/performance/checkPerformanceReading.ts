import { countedFigures, type FigureCounts, type PerformanceReading } from './performanceReading';
import { findMedium } from '../mediums/mediumCatalogue';
import { isUuid } from '$lib/data/isUuid';
import { PerformanceLimits } from './performanceLimits';
import { toPence } from '$lib/data/books/money';
import { validateCount } from './validateCount';
import { validateIsoDate } from '$lib/data/books/isoDate';
import { validateMoney } from '$lib/data/books/moneyColumn';

export type PerformanceReadingCheck = { reading: PerformanceReading } | { problem: string };

type Input = Record<string, unknown>;
type Subjects = Pick<PerformanceReading, 'contentPieceId' | 'campaignId'>;

const noSubject = 'name the piece (contentPieceId) or the campaign (campaignId) the figures are for';

/** One reading as given, every figure checked against its column, or the first reason it cannot be kept. */
export function checkPerformanceReading(input: Input): PerformanceReadingCheck {
	const mediumPath = typeof input.medium === 'string' ? input.medium.trim() : '';
	const medium = findMedium(mediumPath);
	if (medium === null)
		return {
			problem: `${mediumPath || 'That'} is not a medium; call read_brand_catalogue for the mediums`
		};
	const dateProblem = validateIsoDate('observedOn', input.observedOn);
	if (dateProblem !== null) return { problem: asClause(dateProblem) };
	const subjects = subjectsOf(input);
	if ('problem' in subjects) return subjects;
	const counts = countsOf(input);
	if ('problem' in counts) return counts;
	const spend = spendOf(input.spendPounds);
	if (typeof spend === 'string') return { problem: spend };
	const reading = {
		...subjects.subjects,
		...counts.counts,
		mediumPath,
		observedOn: input.observedOn as string,
		spendPence: spend
	};
	return { reading };
}

function subjectsOf(input: Input): { subjects: Subjects } | { problem: string } {
	const contentPieceId = optionalId(input.contentPieceId);
	const campaignId = optionalId(input.campaignId);
	const isNamingNeither = contentPieceId === null && campaignId === null;
	if (isNamingNeither) return { problem: noSubject };
	for (const [field, id] of [
		['contentPieceId', contentPieceId],
		['campaignId', campaignId]
	]) {
		const isMalformed = id !== null && !isUuid(id);
		if (isMalformed)
			return {
				problem: `${field} ${id} is not an id; list_content and list_campaigns give the ids`
			};
	}
	return { subjects: { contentPieceId, campaignId } };
}

function optionalId(candidate: unknown): string | null {
	const id = typeof candidate === 'string' ? candidate.trim() : '';
	return id === '' ? null : id;
}

function countsOf(input: Input): { counts: FigureCounts } | { problem: string } {
	const counts = {} as FigureCounts;
	for (const figure of countedFigures) {
		const count = validateCount(figure, input[figure] ?? 0, PerformanceLimits.largestCount);
		if (typeof count === 'string') return { problem: count };
		counts[figure] = count;
	}
	return { counts };
}

function spendOf(candidate: unknown): number | string {
	const pounds = validateMoney('spendPounds', candidate ?? 0);
	if (typeof pounds === 'string') return asClause(pounds);
	return toPence(pounds);
}

function asClause(refusal: string): string {
	return refusal.replace(/\.$/, '');
}
