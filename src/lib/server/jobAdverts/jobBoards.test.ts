import { describe, expect, it } from 'vitest';
import { isOnJobBoard } from './jobBoards';

describe('isOnJobBoard', () => {
	it('accepts a page on a job board or one of its subdomains', () => {
		expect(isOnJobBoard('https://www.reed.co.uk/jobs/quantity-surveyor/123')).toBe(true);
		expect(isOnJobBoard('https://uk.indeed.com/viewjob?jk=abc')).toBe(true);
		expect(isOnJobBoard('https://findajob.dwp.gov.uk/details/456')).toBe(true);
	});

	it('refuses any other page, LinkedIn among them', () => {
		expect(isOnJobBoard('https://www.linkedin.com/jobs/view/789')).toBe(false);
		expect(isOnJobBoard('https://notreed.co.uk/jobs')).toBe(false);
		expect(isOnJobBoard('not a page')).toBe(false);
	});
});
