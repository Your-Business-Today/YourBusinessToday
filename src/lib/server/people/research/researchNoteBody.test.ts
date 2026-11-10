import { describe, expect, it } from 'vitest';
import { researchNoteBody } from './researchNoteBody';

const findings = {
	personId: '11111111-1111-4111-8111-111111111111',
	summary: 'Runs a joinery business in Surrey.',
	roles: [{ title: 'Managing director', organisation: 'Acme Joinery', sourceUrl: 'https://acmejoinery.co.uk/team' }],
	links: [],
	sources: ['https://acmejoinery.co.uk/about']
};

describe('researchNoteBody', () => {
	it('keeps the summary, each role with its page, and the pages read', () => {
		expect(researchNoteBody(findings)).toBe(
			'Runs a joinery business in Surrey.\n\n' +
				'Roles found:\n- Managing director, Acme Joinery (https://acmejoinery.co.uk/team)\n\n' +
				'Read from:\n- https://acmejoinery.co.uk/about'
		);
	});

	it('leaves out the roles heading when no role was found', () => {
		expect(researchNoteBody({ ...findings, roles: [] })).not.toContain('Roles found');
	});
});
