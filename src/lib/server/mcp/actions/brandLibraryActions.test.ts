import './brandLibraryMocks';
import { beforeEach, describe, expect, it } from 'vitest';
import { brandLibraryActions } from './brandLibraryActions';
import { isGatedByModuleRule, moduleNotSwitchedOn } from '../organisationModuleGate';
import { kitchenId, libraryWorld, resetLibraryWorld } from './brandLibraryFixtures';
import type { McpCaller } from '../resolveMcpCaller';

const nigelOnJewel = {
	accountId: 'nigel',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }]
} as McpCaller;

function runLibraryAction(name: string, input: Record<string, unknown> = {}): Promise<string> {
	const action = brandLibraryActions.find((candidate) => candidate.name === name)!;
	return action.run(nigelOnJewel, { organisationId: 'jewel', ...input }).then(String);
}

describe('reading a brand’s photos and videos over the connector', () => {
	beforeEach(() => resetLibraryWorld());

	it('reads only, behind the one module rule, and refuses while Brand is off', async () => {
		expect(brandLibraryActions.every(isGatedByModuleRule)).toBe(true);
		expect(brandLibraryActions.some((action) => action.isWrite)).toBe(false);
		libraryWorld.switchedOn = [];
		expect(await runLibraryAction('list_brand_library')).toBe(moduleNotSwitchedOn('brand'));
	});

	it('lists every item with what it shows and whether it may be posted', async () => {
		const answer = await runLibraryAction('list_brand_library');
		expect(answer).toContain('Jewel Enterprises’s brand keeps 2 photos and videos, the latest added first:');
		expect(answer).toContain('May be posted: permission was given by Mrs Patel, the homeowner');
		expect(answer).toContain('**door-fitting.mp4** (video, taken 3 Nov 2026');
		expect(answer).toContain('Not to be posted');
	});

	it('says where items are added when the library is empty', async () => {
		libraryWorld.items = [];
		expect(await runLibraryAction('list_brand_library')).toContain('keeps no photos or videos yet');
	});

	it('reads one item with who added it and a link to look at it', async () => {
		const answer = await runLibraryAction('read_brand_library_item', { itemId: kitchenId });
		expect(answer).toContain('a photo (image/jpeg, 2.0 MB)');
		expect(answer).toContain('Added by Nigel');
		expect(answer).toContain(`https://files.example/brand-library/jewel/${kitchenId}/kitchen-finished.jpg?token=t`);
	});

	it('refuses an id that is not one, or not an item of this brand', async () => {
		expect(await runLibraryAction('read_brand_library_item', { itemId: 'kitchen' })).toContain('The itemId must be an id');
		const unknown = '99999999-9999-4999-8999-999999999999';
		expect(await runLibraryAction('read_brand_library_item', { itemId: unknown })).toContain('keeps no photo or video by that itemId');
	});
});
