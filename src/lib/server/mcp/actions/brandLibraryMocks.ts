import './brandJewelMocks';
import { vi } from 'vitest';

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
vi.mock('$lib/server/brandKits/keepBrandSummary', async () => {
	const { libraryWorld } = await import('./brandLibraryFixtures');
	return { findBrandSummary: async () => libraryWorld.brandSummary };
});
vi.mock('$lib/server/brandLibrary/grantLibraryUpload', async () => {
	const { libraryWorld } = await import('./brandLibraryFixtures');
	return {
		grantLibraryUpload: async (_supabase: unknown, adder: unknown, item: unknown) => {
			libraryWorld.granted.push({ adder, item });
			return { itemId: 'item-1', uploadUrl: 'https://files.example/upload?token=u' };
		}
	};
});
vi.mock('$lib/server/brandLibrary/recordLibraryUpload', async (importOriginal) => {
	const { libraryWorld } = await import('./brandLibraryFixtures');
	return { ...(await importOriginal<object>()), recordLibraryUpload: async () => libraryWorld.recording };
});
