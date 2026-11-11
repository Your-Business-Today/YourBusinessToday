import { describe, expect, it } from 'vitest';
import { hasOrganisationsToPick, pickRemembered, type FramePicks } from './framePicks';

const harbour = { id: 'harbour', name: 'Harbour Builders' };
const meadow = { id: 'meadow', name: 'Meadow Lettings' };

describe('pickRemembered', () => {
	it('opens on the option picked last while it is still there', () => {
		expect(pickRemembered([harbour, meadow], 'meadow')).toEqual(meadow);
	});

	it('opens on the first option when nothing was picked, or the pick has gone', () => {
		expect(pickRemembered([harbour, meadow], null)).toEqual(harbour);
		expect(pickRemembered([harbour, meadow], 'gone')).toEqual(harbour);
	});

	it('has nothing to open on when there are no options', () => {
		expect(pickRemembered([], 'meadow')).toBeNull();
	});
});

describe('hasOrganisationsToPick', () => {
	const nothing: FramePicks = {
		organisations: [],
		pickedOrganisationId: null,
		projects: [],
		pickedProjectId: null,
		organisationLinks: [],
		moduleLinks: [],
		homePath: null
	};

	it('shows the pickers to a person with one organisation or more', () => {
		expect(hasOrganisationsToPick({ ...nothing, organisations: [harbour] })).toBe(true);
	});

	it('shows no pickers to a person on no organisation, or signed out', () => {
		expect(hasOrganisationsToPick(nothing)).toBe(false);
		expect(hasOrganisationsToPick(null)).toBe(false);
	});
});
