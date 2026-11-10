import { checkReadings, sortReadings } from '$lib/brand/performance/sortReadings';
import { describeMediumPerformance, describeRecording } from './describePerformance';
import { findBrandRecordsKnown } from '$lib/server/brandPerformance/findBrandRecordsKnown';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { findReadingsSince } from '$lib/server/brandPerformance/findReadingsSince';
import { keepPerformanceReadings } from '$lib/server/brandPerformance/keepPerformanceReadings';
import { noBrandYet } from './brandKitWriteAnswers';
import { PerformanceLimits } from '$lib/brand/performance/performanceLimits';
import { readText } from '../actionTypes';
import { summarisePerformance, totalOf } from '$lib/brand/performance/summarisePerformance';
import { validateIsoDate } from '$lib/data/books/isoDate';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

const { mostReadingsAtOnce } = PerformanceLimits;
const noReadings = 'Nothing was recorded: readings is a list of at least one reading.';

/** Records each reading that fits its columns and is for the brand's own piece or campaign; refuses the rest by name. */
export async function recordPerformance(caller: McpCaller, input: Input, organisation: Organisation) {
	const given = Array.isArray(input.readings) ? (input.readings as unknown[]) : [];
	if (given.length === 0) return noReadings;
	const isTooMany = given.length > mostReadingsAtOnce;
	if (isTooMany) return `Nothing was recorded: ${given.length} readings were given; send at most ${mostReadingsAtOnce} at once.`;
	const summary = await findBrandSummary(caller.supabase, organisation.id);
	if (summary === null) return noBrandYet(organisation);
	const { checked, refusals } = checkReadings(given);
	const known = await findBrandRecordsKnown(caller.supabase, organisation.id, checked);
	const { kept, refusals: sortRefusals } = sortReadings(checked, known);
	const toKeep = { organisationId: organisation.id, accountId: caller.accountId, readings: kept };
	if (kept.length > 0) await keepPerformanceReadings(caller.supabase, toKeep);
	return describeRecording({ kept, refusals: [...refusals, ...sortRefusals] }, organisation.name);
}

/** How the brand has performed since a day, medium by medium, with the total. */
export async function readPerformance(caller: McpCaller, input: Input, organisation: Organisation) {
	const since = readText(input, 'since');
	const dateProblem = validateIsoDate('since', since);
	if (dateProblem !== null) return `Nothing was read: ${dateProblem}`;
	const readings = await findReadingsSince(caller.supabase, organisation.id, since);
	if (readings.length === 0) return `${organisation.name}’s brand has no readings since ${since}.`;
	const mediums = summarisePerformance(readings);
	const lines = [...mediums, totalOf(mediums)].map(describeMediumPerformance);
	return [`${organisation.name}’s brand since ${since}, medium by medium:`, ...lines].join('\n');
}
