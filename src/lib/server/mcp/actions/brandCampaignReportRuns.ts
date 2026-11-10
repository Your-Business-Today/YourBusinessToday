import { describeAudienceRecording, describeCampaignReport } from './describeCampaignReport';
import { findAudienceKeysOnDay } from '$lib/server/brandCampaigns/findAudienceKeysOnDay';
import { findCampaign } from '$lib/server/brandCampaigns/findCampaign';
import { isUuid } from '$lib/data/isUuid';
import { keepCampaignAudience } from '$lib/server/brandCampaigns/keepCampaignAudience';
import { noSuchCampaign } from './brandCampaignAnswers';
import { PerformanceLimits } from '$lib/brand/performance/performanceLimits';
import { readCampaignReport } from '$lib/server/brandCampaigns/readCampaignReport';
import { readText } from '../actionTypes';
import { sortAudienceRows } from '$lib/brand/audience/sortAudienceRows';
import { validateIsoDate } from '$lib/data/books/isoDate';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

const { mostReadingsAtOnce } = PerformanceLimits;
const noBands = 'Nothing was recorded: bands is a list of at least one age band and gender.';

/** Records each band of the campaign's audience that fits its columns and is not yet held for the day; refuses the rest by name. */
export async function recordAudienceOfCampaign(caller: McpCaller, input: Input, organisation: Organisation) {
	const given = Array.isArray(input.bands) ? (input.bands as unknown[]) : [];
	if (given.length === 0) return noBands;
	const isTooMany = given.length > mostReadingsAtOnce;
	if (isTooMany) return `Nothing was recorded: ${given.length} bands were given; send at most ${mostReadingsAtOnce} at once.`;
	const observedOn = readText(input, 'observedOn');
	const dateProblem = validateIsoDate('observedOn', observedOn);
	if (dateProblem !== null) return `Nothing was recorded: ${dateProblem}`;
	const campaign = { organisationId: organisation.id, campaignId: readText(input, 'campaignId') };
	if (!isUuid(campaign.campaignId)) return noSuchCampaign;
	const campaignHeld = await findCampaign(caller.supabase, campaign.organisationId, campaign.campaignId);
	if (campaignHeld === null) return noSuchCampaign;
	const keysHeld = await findAudienceKeysOnDay(caller.supabase, campaign, observedOn);
	const { kept, refusals } = sortAudienceRows(given, keysHeld);
	const toKeep = { ...campaign, observedOn, accountId: caller.accountId, rows: kept };
	if (kept.length > 0) await keepCampaignAudience(caller.supabase, toKeep);
	return describeAudienceRecording({ kept, refusals }, observedOn);
}

/** One campaign's report, and the address of its page. */
export async function readReportOfCampaign(caller: McpCaller, input: Input, organisation: Organisation) {
	const report = await readCampaignReport(caller.supabase, organisation.id, readText(input, 'campaignId'));
	if (report === null) return noSuchCampaign;
	return describeCampaignReport(report, organisation.id);
}
