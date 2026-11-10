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
	const { flowWorld } = await import('./brandContentFlowWorld');
	return { getSwitchedOnModules: async () => flowWorld.switchedOn };
});
vi.mock('$lib/server/brandContent/findContentPieceStage', async () => {
	const { flowWorld } = await import('./brandContentFlowWorld');
	return { findContentPieceStage: async () => flowWorld.stage };
});
vi.mock('$lib/server/brandContent/keepContentReview', async () => {
	const { flowWorld } = await import('./brandContentFlowWorld');
	return { keepContentReview: async (_supabase: unknown, review: unknown) => void flowWorld.reviews.push(review) };
});
vi.mock('$lib/server/brandContent/moveContentPiece', async () => {
	const { movePieceInWorld } = await import('./brandContentFlowWorld');
	return { moveContentPiece: movePieceInWorld };
});
