import { describe, expect, it } from 'vitest';
import { joineryContextInput } from '$lib/server/companyContext/companyContextFixtures';
import { validateCompanyContext } from '$lib/server/companyContext/validateCompanyContext';
import { describeCompanyContext, noCompanyContextYet } from './describeCompanyContext';

function joineryVersion() {
	const draft = validateCompanyContext(joineryContextInput());
	if ('refusal' in draft) throw new Error(draft.refusal);
	return { ...draft, versionNumber: 3, recordedAt: '2026-11-10T17:00:00Z' };
}

describe('the company context as the connector reads it out', () => {
	it('says the version, the stage, what is connected and how far the review has got', () => {
		const text = describeCompanyContext('Oak & Ash Joinery', joineryVersion());
		expect(text).toContain('**Company context of Oak & Ash Joinery, version 3**, recorded 2026-11-10.');
		expect(text).toContain('Stage: Map your data sources, step 1 of 7 of the offer.');
		expect(text).toContain('Connected in Claude: Gmail, Xero.');
		expect(text).toContain('5 parts: 3 not checked, 1 right, 1 not right.');
	});

	it('lists each part with its review, a process with its steps and roles, and each link as a sentence', () => {
		const text = describeCompanyContext('Oak & Ash Joinery', joineryVersion());
		expect(text).toContain('Seen in Google Drive, at Shared drive, Quotes folder.');
		expect(text).toContain('Review: not right: The site visit comes before the drawing, not after.');
		expect(text).toContain('   1. Draw the job (Estimator)');
		expect(text).toContain('- Quote spreadsheet creates Quote');
		expect(text).toContain('- Quote is created by Estimator');
	});

	it('says an organisation with no version yet starts empty', () => {
		expect(noCompanyContextYet('Oak & Ash Joinery')).toContain('first run records version 1');
	});
});
