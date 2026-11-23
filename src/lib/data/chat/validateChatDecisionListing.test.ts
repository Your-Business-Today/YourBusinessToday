import { describe, expect, it } from 'vitest';
import { validateDecisionListing } from './validateChatDecisionListing';
import { chatDecisionLimits, chatDecisionListingRefusals } from './chatDecisionRules';

const finance = '11111111-1111-4111-8111-111111111111';

describe('validateDecisionListing', () => {
	it('lists every room, open and closed, the usual number, when nothing is asked', () => {
		expect(validateDecisionListing({})).toEqual({ roomId: null, status: null, limit: chatDecisionLimits.usualDecisionsListed });
		expect(validateDecisionListing({ roomId: ' ' })).toMatchObject({ roomId: null });
	});

	it('takes the room, the status and the limit asked for', () => {
		expect(validateDecisionListing({ roomId: ` ${finance} `, status: 'open', limit: 3 })).toEqual({ roomId: finance, status: 'open', limit: 3 });
		expect(validateDecisionListing({ status: 'closed', limit: chatDecisionLimits.latestDecisionsShown })).toMatchObject({ status: 'closed' });
	});

	it('refuses a status that is neither open nor closed', () => {
		for (const status of ['waiting', '', 1, null]) expect(validateDecisionListing({ status })).toBe(chatDecisionListingRefusals.status);
	});

	it('refuses a limit that is not a whole number from 1 to the most the site shows, never cutting it to fit', () => {
		for (const limit of [0, chatDecisionLimits.latestDecisionsShown + 1, 2.5, '10']) {
			expect(validateDecisionListing({ limit })).toBe(chatDecisionListingRefusals.limit);
		}
	});
});
