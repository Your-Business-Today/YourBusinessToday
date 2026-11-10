import { campaignStatuses, isCampaignStatus, type PieceForCampaign } from '$lib/brand/campaigns/campaign';
import { checkCampaignPlan } from '$lib/brand/campaigns/checkCampaignPlan';
import { describeCampaign } from './describeCampaign';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { findCampaignStatus } from '$lib/server/brandCampaigns/findCampaignStatus';
import { findCampaigns } from '$lib/server/brandCampaigns/findCampaigns';
import { findContentPieceStage } from '$lib/server/brandContent/findContentPieceStage';
import { isUuid } from '$lib/data/isUuid';
import { keepCampaign } from '$lib/server/brandCampaigns/keepCampaign';
import { noBrandYet } from './brandKitWriteAnswers';
import { noSuchCampaign } from './brandCampaignAnswers';
import { noSuchPiece } from './brandContentAnswers';
import { putPieceInCampaign } from '$lib/server/brandCampaigns/putPieceInCampaign';
import { readText } from '../actionTypes';
import { setCampaignStatus } from '$lib/server/brandCampaigns/setCampaignStatus';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

const statusRefusal = `The status was not set: status is one of ${campaignStatuses.join(', ')}. Nothing was changed.`;
const notConnected = 'Nothing here connects to an ad account: the money is spent by hand.';

/** Plans a campaign with its budget and dates, checked against its columns, at planned. */
export async function planCampaign(caller: McpCaller, input: Input, organisation: Organisation) {
	const check = checkCampaignPlan(input);
	if ('problem' in check) return `The campaign was not planned: ${check.problem}. Nothing was kept.`;
	const summary = await findBrandSummary(caller.supabase, organisation.id);
	if (summary === null) return noBrandYet(organisation);
	const { plan } = check;
	const campaignId = await keepCampaign(caller.supabase, { organisationId: organisation.id, accountId: caller.accountId, plan });
	return `Planned “${plan.name}” for ${organisation.name}’s brand (id ${campaignId}). It is at planned. ${notConnected}`;
}

/** The brand's campaigns, latest start first, with the pieces in each. */
export async function listCampaigns(caller: McpCaller, _input: Input, organisation: Organisation) {
	const campaigns = await findCampaigns(caller.supabase, organisation.id);
	if (campaigns.length === 0) return `${organisation.name}’s brand has no campaigns yet.`;
	return campaigns.map(describeCampaign).join('\n');
}

/** Puts one of the brand's pieces behind one of its campaigns. */
export async function addContentToCampaign(caller: McpCaller, input: Input, organisation: Organisation) {
	const asked = {
		organisationId: organisation.id,
		campaignId: readText(input, 'campaignId'),
		contentPieceId: readText(input, 'contentPieceId'),
		accountId: caller.accountId
	};
	const isCampaignFound = await isCampaignOfBrand(caller, asked);
	if (!isCampaignFound) return noSuchCampaign;
	const isPieceFound = await isPieceOfBrand(caller, asked);
	if (!isPieceFound) return noSuchPiece;
	await putPieceInCampaign(caller.supabase, asked);
	return 'The piece is behind the campaign. list_campaigns shows every piece in it.';
}

async function isCampaignOfBrand(caller: McpCaller, { organisationId, campaignId }: PieceForCampaign) {
	if (!isUuid(campaignId)) return false;
	const status = await findCampaignStatus(caller.supabase, organisationId, campaignId);
	return status !== null;
}

async function isPieceOfBrand(caller: McpCaller, { organisationId, contentPieceId }: PieceForCampaign) {
	if (!isUuid(contentPieceId)) return false;
	const stage = await findContentPieceStage(caller.supabase, organisationId, contentPieceId);
	return stage !== null;
}

/** Marks a campaign planned, running, paused or ended. */
export async function setStatusOfCampaign(caller: McpCaller, input: Input, organisation: Organisation) {
	const status = readText(input, 'status');
	if (!isCampaignStatus(status)) return statusRefusal;
	const campaignId = readText(input, 'campaignId');
	if (!isUuid(campaignId)) return noSuchCampaign;
	const isFound = await setCampaignStatus(caller.supabase, organisation.id, campaignId, status);
	if (!isFound) return noSuchCampaign;
	return `The campaign is now ${status}.`;
}
