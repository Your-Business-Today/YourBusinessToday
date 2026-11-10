import type { ReadingFigures } from '$lib/brand/performance/summarisePerformance';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const PageOfReadings = { rows: 1000 } as const;

const figureColumns =
	'medium_path, views, watch_seconds, likes, comments, shares, saves, clicks, conversions, impressions, reach, spend_pence';

/** Every reading of the organisation's brand on or after the day, page by page so none is left out. */
export async function findReadingsSince(
	supabase: SupabaseClient,
	organisationId: string,
	since: string
): Promise<ReadingFigures[]> {
	const readings: ReadingFigures[] = [];
	for (let firstRow = 0; ; firstRow += PageOfReadings.rows) {
		const page = await findPage(supabase, organisationId, since, firstRow);
		readings.push(...page.map(figuresOf));
		const isLastPage = page.length < PageOfReadings.rows;
		if (isLastPage) return readings;
	}
}

async function findPage(supabase: SupabaseClient, organisationId: string, since: string, firstRow: number): Promise<Row[]> {
	const { data, error } = await supabase
		.from('brand_performance_readings')
		.select(figureColumns)
		.eq('organisation_id', organisationId)
		.gte('observed_on', since)
		.order('id', { ascending: true })
		.range(firstRow, firstRow + PageOfReadings.rows - 1);
	if (error) throw error;
	return (data ?? []) as Row[];
}

function figuresOf(row: Row): ReadingFigures {
	return {
		mediumPath: row.medium_path as string,
		views: Number(row.views),
		watchSeconds: Number(row.watch_seconds),
		likes: Number(row.likes),
		comments: Number(row.comments),
		shares: Number(row.shares),
		saves: Number(row.saves),
		clicks: Number(row.clicks),
		conversions: Number(row.conversions),
		impressions: Number(row.impressions),
		reach: Number(row.reach),
		spendPence: Number(row.spend_pence)
	};
}
