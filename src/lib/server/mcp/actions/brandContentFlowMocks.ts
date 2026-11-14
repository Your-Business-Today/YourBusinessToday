import './brandJewelMocks';
import { vi } from 'vitest';

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
