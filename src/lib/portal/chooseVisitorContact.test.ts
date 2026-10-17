import { describe, expect, it } from 'vitest';
import { chooseVisitorContact } from './chooseVisitorContact';

const atAcme = { id: 'contact-at-acme', clientId: 'acme' };
const atBuild = { id: 'contact-at-build', clientId: 'build' };
const organisations = [
	{ clientId: 'acme', name: 'Acme' },
	{ clientId: 'build', name: 'Build Co' }
];

describe('the organisation a person at several works in', () => {
	it('is the one they chose', () => {
		expect(chooseVisitorContact([atAcme, atBuild], organisations, 'build')).toBe(atBuild);
	});

	it('is the first by name when they have not chosen', () => {
		expect(chooseVisitorContact([atBuild, atAcme], organisations, null)).toBe(atAcme);
	});

	it('falls back to the first by name when they are no longer a contact at the one they chose', () => {
		expect(chooseVisitorContact([atBuild, atAcme], organisations, 'gone')).toBe(atAcme);
	});

	it('is their only organisation when they have one', () => {
		expect(chooseVisitorContact([atBuild], [organisations[1]], 'acme')).toBe(atBuild);
	});
});
