import { describe, expect, it } from 'vitest';
import { personLinkRefusals, validatePersonLink } from './personLinkRules';
import { noteBodyRefusal, validateNoteBody } from './personNoteRules';

describe('a link kept on a person, checked against its columns', () => {
	it('takes a label and a full web address, trimmed', () => {
		expect(validatePersonLink({ label: ' Company site ', url: ' https://rivers.example/about ' })).toEqual({
			label: 'Company site',
			url: 'https://rivers.example/about'
		});
	});

	it('refuses a blank or overlong label, and an address that is not a web page', () => {
		expect(validatePersonLink({ label: '', url: 'https://rivers.example' })).toBe(personLinkRefusals.label);
		expect(validatePersonLink({ label: 'x'.repeat(81), url: 'https://rivers.example' })).toBe(personLinkRefusals.label);
		expect(validatePersonLink({ label: 'Site', url: 'rivers.example' })).toBe(personLinkRefusals.url);
		expect(validatePersonLink({ label: 'Site', url: 'ftp://rivers.example' })).toBe(personLinkRefusals.url);
		expect(validatePersonLink({ label: 'Site', url: `https://rivers.example/${'a'.repeat(500)}` })).toBe(personLinkRefusals.url);
	});
});

describe('a note written on a person', () => {
	it('takes its words trimmed and refuses nothing or too much', () => {
		expect(validateNoteBody('  Met at the trade show. ')).toEqual({ body: 'Met at the trade show.' });
		expect(validateNoteBody('   ')).toBe(noteBodyRefusal);
		expect(validateNoteBody('x'.repeat(4001))).toBe(noteBodyRefusal);
	});
});
