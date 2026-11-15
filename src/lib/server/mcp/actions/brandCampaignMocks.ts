import './brandJewelMocks';
import { vi } from 'vitest';

vi.mock('$lib/server/organisations/getSwitchedOnModules', async () => {
	const { campaignWorld } = await import('./brandCampaignWorld');
	return { getSwitchedOnModules: async () => campaignWorld.switchedOn };
});
vi.mock('$lib/server/brandKits/keepBrandSummary', async () => {
	const { campaignWorld } = await import('./brandCampaignWorld');
	return { findBrandSummary: async () => (campaignWorld.hasBrand ? 'A fire door company' : null) };
});
vi.mock('$lib/server/brandCampaigns/keepCampaign', async () => {
	const { keepCampaignInWorld } = await import('./brandCampaignWorld');
	return { keepCampaign: keepCampaignInWorld };
});
vi.mock('$lib/server/brandCampaigns/findCampaigns', async () => {
	const { campaignWorld } = await import('./brandCampaignWorld');
	return { findCampaigns: async () => campaignWorld.campaigns };
});
vi.mock('$lib/server/brandCampaigns/findCampaignStatus', async () => {
	const { findStatusInWorld } = await import('./brandCampaignWorld');
	return { findCampaignStatus: findStatusInWorld };
});
vi.mock('$lib/server/brandCampaigns/setCampaignStatus', async () => {
	const { setStatusInWorld } = await import('./brandCampaignWorld');
	return { setCampaignStatus: setStatusInWorld };
});
vi.mock('$lib/server/brandCampaigns/putPieceInCampaign', async () => {
	const { putPieceInWorld } = await import('./brandCampaignWorld');
	return { putPieceInCampaign: putPieceInWorld };
});
vi.mock('$lib/server/brandContent/findContentPieceStage', async () => {
	const { findPieceStageInWorld } = await import('./brandCampaignWorld');
	return { findContentPieceStage: findPieceStageInWorld };
});
