import { describe, expect, it } from 'vitest';
import { joineryVersion } from '$lib/server/companyContext/companyContextFixtures';
import { contextChanges } from '$lib/data/companyContext/contextChanges';
import { describeCompanyContext, noCompanyContextYet } from './describeCompanyContext';

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

	it('puts the parts marked not right first, in the client\'s words, and says what changed', () => {
		const version = joineryVersion();
		const earlier = { ...version, versionNumber: 2, parts: version.parts.slice(1) };
		const changes = contextChanges(earlier, version);
		const text = describeCompanyContext('Oak & Ash Joinery', version, changes);
		expect(text).toContain('### Marked not right by the client');
		expect(text).toContain('- Quoting (quoting): The site visit comes before the drawing, not after.');
		expect(text).toContain('### Changed since version 2\n- New: Bespoke joinery.');
	});

	it('says whether the client has confirmed the version, and what follows', () => {
		const version = joineryVersion();
		const notYet = describeCompanyContext('Oak & Ash Joinery', version);
		expect(notYet).toContain('Not confirmed by the client yet');
		const confirmation = { versionNumber: 3, confirmedAt: '2026-11-10T18:30:00Z' };
		const confirmed = describeCompanyContext('Oak & Ash Joinery', version, null, confirmation);
		expect(confirmed).toContain('Confirmed by the client on 2026-11-10: this is their confirmed context.');
		expect(confirmed).toContain('A revised version needs confirming again.');
	});
});
