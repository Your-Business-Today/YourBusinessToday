import { vi } from 'vitest';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/ensureBusinessBrainPart', () => ({ ensureBusinessBrainPart: async () => 'part-1' }));
vi.mock('$lib/server/businessBrain/fileBusinessBrainSource', async () => {
	const { brain } = await import('./businessBrainBatchWorld');
	return {
		fileBusinessBrainSource: async (_supabase: unknown, _organisationId: string, source: Record<string, unknown>) => {
			brain.sourcesNamed.push(source);
			return brain.sharedSourceId;
		}
	};
});
vi.mock('$lib/server/businessBrain/fileBusinessBrainPage', async () => {
	const { brain } = await import('./businessBrainBatchWorld');
	return {
		findBusinessBrainPage: async (_supabase: unknown, _partId: string, slug: string) =>
			brain.slugsAlreadyFiled.includes(slug) ? { pageId: 'page-0', title: 'Filed before' } : null,
		fileBusinessBrainPage: async (_supabase: unknown, place: Record<string, unknown>) => {
			brain.pagesFiled.push(place);
			return { isNew: true, pageId: 'page-1' };
		}
	};
});
