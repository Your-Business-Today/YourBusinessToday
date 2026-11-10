import { campaignId } from './brandCampaignWorld';
import type { AudienceRow, AudienceToKeep } from '$lib/brand/audience/audienceRow';
import type { CampaignFigures } from '$lib/brand/campaigns/campaignReport';
import type { CampaignHead } from '$lib/brand/campaigns/campaign';

const autumnDoors: CampaignHead = {
	id: campaignId,
	name: 'Autumn fire doors',
	objective: 'clickThrough',
	budgetPence: 50000,
	startsOn: '2026-11-13',
	endsOn: '2026-11-17',
	status: 'running'
};

/** A brand with one running campaign, its figures and the audiences kept on it, held in memory, for the report actions' tests. */
export const reportWorld = {
	switchedOn: ['brand'] as string[],
	campaigns: [autumnDoors],
	figures: { spendPence: 0, impressions: 0, reach: 0, clicks: 0 } as CampaignFigures,
	kept: [] as AudienceToKeep[]
};

export function resetReportWorld() {
	Object.assign(reportWorld, {
		switchedOn: ['brand'],
		campaigns: [autumnDoors],
		figures: { spendPence: 0, impressions: 0, reach: 0, clicks: 0 },
		kept: []
	});
}

export function findCampaignInWorld(_supabase: unknown, _organisationId: string, id: string) {
	return Promise.resolve(reportWorld.campaigns.find((campaign) => campaign.id === id) ?? null);
}

export function findKeysInWorld(_supabase: unknown, _campaign: unknown, observedOn: string) {
	const rows = reportWorld.kept.filter((kept) => kept.observedOn === observedOn).flatMap((kept) => kept.rows);
	return Promise.resolve(new Set(rows.map((row) => `${row.ageBand}|${row.gender}`)));
}

export function keepAudienceInWorld(_supabase: unknown, toKeep: AudienceToKeep) {
	reportWorld.kept.push(toKeep);
	return Promise.resolve();
}

export function findAudienceInWorld() {
	const latest = [...reportWorld.kept].sort((left, right) => right.observedOn.localeCompare(left.observedOn))[0];
	if (latest === undefined) return Promise.resolve({ observedOn: null, rows: [] as AudienceRow[] });
	return Promise.resolve({ observedOn: latest.observedOn, rows: latest.rows });
}
