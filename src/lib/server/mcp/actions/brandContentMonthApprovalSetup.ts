import { vi } from 'vitest';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['brand'] }));
vi.mock('$lib/server/brandKits/loadBrandKit', async () => {
	const { builtInTraits } = await import('$lib/brand/traits/traitCatalogue');
	return { loadBrandKit: async () => ({ catalogue: builtInTraits, decisions: [] }) };
});
vi.mock('$lib/server/brandContent/findPostPictures', () => ({
	findPostPictures: async () => new Map([['doors', { needed: 'The team at a fire door', expectedFrom: 'Site team', chosen: [] }]])
}));
vi.mock('$lib/server/brandContent/findPlannedPieces', async () => {
	const { plannedPiecesInWorld } = await import('./brandContentMonthApprovalWorld');
	return { findPlannedPieces: async () => plannedPiecesInWorld() };
});
vi.mock('$lib/server/brandContent/findContentPieceStage', async () => {
	const { stageInWorld } = await import('./brandContentMonthApprovalWorld');
	return { findContentPieceStage: async (...given: Parameters<typeof stageInWorld>) => stageInWorld(...given) };
});
vi.mock('$lib/server/brandContent/keepContentReview', async () => {
	const { approvalWorld } = await import('./brandContentMonthApprovalWorld');
	return { keepContentReview: async (_supabase: unknown, review: unknown) => void approvalWorld.reviews.push(review) };
});
vi.mock('$lib/server/brandContent/moveContentPiece', async () => {
	const { movePieceInApprovalWorld } = await import('./brandContentMonthApprovalWorld');
	return { moveContentPiece: async (...given: Parameters<typeof movePieceInApprovalWorld>) => movePieceInApprovalWorld(...given) };
});
