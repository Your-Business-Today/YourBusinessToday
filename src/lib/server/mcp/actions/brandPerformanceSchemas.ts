import { countedFigures } from '$lib/brand/performance/performanceReading';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { PerformanceLimits } from '$lib/brand/performance/performanceLimits';

const figureDescriptions: Record<string, string> = {
	views: 'Views the platform counted that day',
	watchSeconds: 'Seconds watched in all that day',
	likes: 'Likes that day',
	comments: 'Comments that day',
	shares: 'Shares that day',
	saves: 'Saves that day',
	clicks: 'Clicks that day',
	conversions: 'Conversions that day'
};

const countFields = Object.fromEntries(
	countedFigures.map((figure) => [figure, { type: 'integer', minimum: 0, description: figureDescriptions[figure] }])
);

const readingSchema = objectSchema(
	{
		medium: textField('The medium the figures are for, as read_brand_catalogue lists it, such as video.short.reels'),
		observedOn: textField('The day the figures are for, written as 2026-11-30'),
		contentPieceId: textField('The piece the figures are for, as list_content gives it; give this, campaignId or both'),
		campaignId: textField('The campaign the figures are for, as list_campaigns gives it; give this, contentPieceId or both'),
		...countFields,
		spendPounds: {
			type: 'number',
			minimum: 0,
			description: 'Ad spend that day in pounds, such as 12.50'
		}
	},
	['medium', 'observedOn']
);

export const recordPerformanceSchema = objectSchema(
	{
		organisationId: organisationIdField,
		readings: {
			type: 'array',
			items: readingSchema,
			minItems: 1,
			maxItems: PerformanceLimits.mostReadingsAtOnce,
			description: `The readings, at most ${PerformanceLimits.mostReadingsAtOnce} at once: one per piece or campaign, medium and day`
		}
	},
	['organisationId', 'readings']
);

export const readPerformanceSchema = objectSchema(
	{
		organisationId: organisationIdField,
		since: textField('The first day to count, written as 2026-11-01')
	},
	['organisationId', 'since']
);
