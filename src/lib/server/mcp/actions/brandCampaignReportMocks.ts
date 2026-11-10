import { vi } from 'vitest';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', async () => {
	const { reportWorld } = await import('./brandCampaignReportFixtures');
	return { getSwitchedOnModules: async () => reportWorld.switchedOn };
});
vi.mock('$lib/server/brandCampaigns/findCampaign', async () => {
	const { findCampaignInWorld } = await import('./brandCampaignReportFixtures');
	return { findCampaign: findCampaignInWorld };
});
vi.mock('$lib/server/brandCampaigns/findCampaignFigures', async () => {
	const { reportWorld } = await import('./brandCampaignReportFixtures');
	return { findCampaignFigures: async () => reportWorld.figures };
});
vi.mock('$lib/server/brandCampaigns/findCampaignAudience', async () => {
	const { findAudienceInWorld } = await import('./brandCampaignReportFixtures');
	return { findCampaignAudience: findAudienceInWorld };
});
vi.mock('$lib/server/brandCampaigns/findAudienceKeysOnDay', async () => {
	const { findKeysInWorld } = await import('./brandCampaignReportFixtures');
	return { findAudienceKeysOnDay: findKeysInWorld };
});
vi.mock('$lib/server/brandCampaigns/keepCampaignAudience', async () => {
	const { keepAudienceInWorld } = await import('./brandCampaignReportFixtures');
	return { keepCampaignAudience: keepAudienceInWorld };
});
