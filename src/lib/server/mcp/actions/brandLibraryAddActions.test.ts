import './brandLibraryMocks';
import { beforeEach, describe, expect, it } from 'vitest';
import { brandLibraryActions } from './brandLibraryActions';
import { kitchenId, libraryWorld, resetLibraryWorld } from './brandLibraryFixtures';
import type { McpCaller } from '../resolveMcpCaller';

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: true,
	organisationMemberships: []
} as unknown as McpCaller;

function runLibraryAction(name: string, input: Record<string, unknown> = {}): Promise<string> {
	const action = brandLibraryActions.find((candidate) => candidate.name === name)!;
	return action.run(nigelOnJewel, { organisationId: 'jewel', ...input }).then(String);
}

const kitchenPhoto = {
	filename: 'kitchen-finished.jpg',
	mimeType: 'image/jpeg',
	byteCount: 2_097_152,
	shows: 'The finished kitchen at Mill Lane',
	takenOn: '2026-11-03',
	posting: 'permission_given',
	permissionGivenBy: 'Mrs Patel, the homeowner'
};

describe('adding a client’s photos and videos to their library from chat', () => {
	beforeEach(() => resetLibraryWorld());

	it('keeps the item as described under the person asking and gives the link to send it to', async () => {
		const answer = await runLibraryAction('add_brand_library_item', kitchenPhoto);
		expect(answer).toContain('curl --fail --upload-file');
		expect(answer).toContain('https://files.example/upload?token=u');
		expect(answer).toContain('record_brand_library_item with organisationId jewel and itemId item-1');
		expect(libraryWorld.granted[0]).toMatchObject({ adder: { organisationId: 'jewel', accountId: 'nigel' }, item: { shows: kitchenPhoto.shows } });
	});

	it('refuses by name a value that does not fit its column, keeping nothing', async () => {
		expect(await runLibraryAction('add_brand_library_item', { ...kitchenPhoto, mimeType: 'application/pdf' })).toContain('only photos, videos and music');
		expect(await runLibraryAction('add_brand_library_item', { ...kitchenPhoto, byteCount: 60 * 1024 * 1024 })).toContain('byteCount');
		expect(await runLibraryAction('add_brand_library_item', { ...kitchenPhoto, permissionGivenBy: '' })).toContain('permissionGivenBy is empty');
		expect(libraryWorld.granted).toHaveLength(0);
	});

	it('asks for the brand to be described before anything is added', async () => {
		libraryWorld.brandSummary = null;
		expect(await runLibraryAction('add_brand_library_item', kitchenPhoto)).toContain('describe_brand');
		expect(libraryWorld.granted).toHaveLength(0);
	});

	it('records the file once it arrives, and says what to do when it has not', async () => {
		expect(await runLibraryAction('record_brand_library_item', { itemId: kitchenId })).toContain('Kept in Jewel Enterprises’s Brand library (2.0 MB');
		libraryWorld.recording = { status: 'not_arrived' };
		expect(await runLibraryAction('record_brand_library_item', { itemId: kitchenId })).toContain('Nothing has arrived');
		libraryWorld.recording = { status: 'not_granted' };
		expect(await runLibraryAction('record_brand_library_item', { itemId: kitchenId })).toContain('Call add_brand_library_item');
		expect(await runLibraryAction('record_brand_library_item', { itemId: 'nope' })).toContain('The itemId must be an id');
	});
});
