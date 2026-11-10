import { describe, expect, it } from 'vitest';
import { businessBrainAddresses, isRevisionId } from './businessBrainAddresses';

const organisationId = '11111111-1111-1111-1111-111111111111';
const pageId = '22222222-2222-2222-2222-222222222222';

describe('businessBrainAddresses', () => {
	const addresses = businessBrainAddresses(organisationId);

	it('opens Your Business Brain under the organisation, where the side bar finds its page', () => {
		expect(addresses.home).toBe(`/organisations/${organisationId}/business-brain`);
	});

	it('names a page, an earlier version of it and a kept file beneath it', () => {
		expect(addresses.page(pageId)).toBe(`${addresses.home}/pages/${pageId}`);
		expect(addresses.revision(pageId, 7)).toBe(`${addresses.home}/pages/${pageId}?revision=7`);
		expect(addresses.file(pageId)).toBe(`${addresses.home}/files/${pageId}`);
	});
});

describe('isRevisionId', () => {
	it('takes a whole number from one up', () => {
		expect(isRevisionId('1')).toBe(true);
		expect(isRevisionId('4021')).toBe(true);
	});

	it('refuses anything else, so no read is made of it', () => {
		for (const candidate of ['', '0', '-3', '1.5', '07', 'seven', '1e3', '9999999999999999']) {
			expect(isRevisionId(candidate)).toBe(false);
		}
	});
});
