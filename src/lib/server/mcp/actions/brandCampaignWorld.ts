import { contentPieceId } from './brandContentFixtures';
import type { Campaign, CampaignStatus, CampaignToKeep, PieceForCampaign } from '$lib/brand/campaigns/campaign';

export const campaignId = '2c8e4d3f-5b2e-4d66-8b1f-4a2f3e5d6c7b';

/** A brand with one piece and its campaigns, held in memory, for the tests of the campaign actions. */
export const campaignWorld = {
	switchedOn: ['brand'] as string[],
	hasBrand: true,
	campaigns: [] as Campaign[],
	kept: [] as CampaignToKeep[],
	piecesPut: [] as PieceForCampaign[]
};

export function resetCampaignWorld() {
	Object.assign(campaignWorld, { switchedOn: ['brand'], hasBrand: true, campaigns: [], kept: [], piecesPut: [] });
}

export function keepCampaignInWorld(_supabase: unknown, campaign: CampaignToKeep) {
	campaignWorld.kept.push(campaign);
	campaignWorld.campaigns.push({ ...campaign.plan, id: campaignId, status: 'planned', pieces: [] });
	return Promise.resolve(campaignId);
}

export function findStatusInWorld(_supabase: unknown, _organisationId: string, id: string) {
	const campaign = campaignWorld.campaigns.find((candidate) => candidate.id === id);
	return Promise.resolve(campaign?.status ?? null);
}

export function setStatusInWorld(_supabase: unknown, _organisationId: string, id: string, status: CampaignStatus) {
	const campaign = campaignWorld.campaigns.find((candidate) => candidate.id === id);
	if (campaign === undefined) return Promise.resolve(false);
	campaign.status = status;
	return Promise.resolve(true);
}

export function putPieceInWorld(_supabase: unknown, piece: PieceForCampaign) {
	campaignWorld.piecesPut.push(piece);
	const campaign = campaignWorld.campaigns.find((candidate) => candidate.id === piece.campaignId);
	campaign?.pieces.push({ contentPieceId: piece.contentPieceId, title: 'Fire doors', stage: 'approved' });
	return Promise.resolve();
}

export function findPieceStageInWorld(_supabase: unknown, _organisationId: string, id: string) {
	return Promise.resolve(id === contentPieceId ? 'approved' : null);
}
