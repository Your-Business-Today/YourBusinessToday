import { vi } from 'vitest';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return {
		getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null)
	};
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', async () => {
	const { libraryWorld } = await import('./brandLibraryFixtures');
	return { getSwitchedOnModules: async () => libraryWorld.switchedOn };
});
vi.mock('$lib/server/brandLibrary/findLibraryItems', async () => {
	const { findItemInWorld, readLibraryInWorld } = await import('./brandLibraryFixtures');
	return {
		readKeptLibrary: async () => readLibraryInWorld(),
		findKeptLibraryItem: async (_supabase: unknown, _organisationId: string, itemId: string) => findItemInWorld(itemId)
	};
});
vi.mock('$lib/server/accounts/getAccountsById', () => ({
	getAccountsById: async () => [{ id: 'nigel', name: 'Nigel', email: 'nigel@example.com' }]
}));
vi.mock('$lib/server/storage/signFetchLink', () => ({
	fetchLinkLifetimeMinutes: 10,
	signFetchLink: async (_supabase: unknown, bucket: string, file: { storagePath: string }) =>
		`https://files.example/${bucket}/${file.storagePath}?token=t`
}));
