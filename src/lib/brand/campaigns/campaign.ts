/** Where a brand's campaign stands: planned, running, paused or ended. */
export const CampaignStatuses = {
	planned: 'planned',
	running: 'running',
	paused: 'paused',
	ended: 'ended'
} as const;

export type CampaignStatus = (typeof CampaignStatuses)[keyof typeof CampaignStatuses];

export const campaignStatuses: CampaignStatus[] = Object.values(CampaignStatuses);

/** A campaign as a person's Claude plans it, every value checked against its column. */
export type CampaignPlan = {
	name: string;
	objective: string;
	budgetPence: number;
	startsOn: string;
	endsOn: string;
};

/** A campaign planned on an organisation's brand, and who planned it. */
export type CampaignToKeep = { organisationId: string; accountId: string; plan: CampaignPlan };

/** One of the brand's pieces put behind one of its campaigns, and who put it there. */
export type PieceForCampaign = { organisationId: string; campaignId: string; contentPieceId: string; accountId: string };

/** A piece of the brand's content that a campaign holds. */
export type CampaignPiece = { contentPieceId: string; title: string; stage: string };

export type Campaign = CampaignPlan & { id: string; status: CampaignStatus; pieces: CampaignPiece[] };

export function isCampaignStatus(candidate: string): candidate is CampaignStatus {
	return (campaignStatuses as string[]).includes(candidate);
}
