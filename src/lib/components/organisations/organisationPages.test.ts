import { describe, expect, it } from 'vitest';
import { organisationHref, organisationPages } from './organisationPages';

const harbour = 'harbour-group';

describe('organisationHref', () => {
	it('gives the overview the organisation’s own address', () => {
		expect(organisationHref(harbour)).toBe('/organisations/harbour-group');
		expect(organisationHref(harbour, organisationPages.overview)).toBe('/organisations/harbour-group');
	});

	it('gives each other page its own address beneath it, for the side bar to link to', () => {
		expect(organisationHref(harbour, organisationPages.domain)).toBe('/organisations/harbour-group/domain');
		expect(organisationHref(harbour, organisationPages.taskManagement)).toBe('/organisations/harbour-group/task-management');
	});
});
