import { describe, expect, it } from 'vitest';
import { pageListedBeside } from './premisesListedPage';

const ownSite = 'https://thelamb.example/';
const socialPage = 'https://www.instagram.com/thelambsurbiton';

describe('the page a premises lists, beside the website of the company made from it', () => {
	it('is the listed page where the company took no website from it', () => {
		expect(pageListedBeside('', socialPage)).toBe(socialPage);
	});

	it('is the listed page where the company has since been given another website', () => {
		expect(pageListedBeside(ownSite, socialPage)).toBe(socialPage);
	});

	it('is nothing where the company took the listed page as its own website', () => {
		expect(pageListedBeside(ownSite, ownSite)).toBe('');
	});

	it('is nothing where the premises lists no page', () => {
		expect(pageListedBeside(ownSite, '')).toBe('');
		expect(pageListedBeside('', '')).toBe('');
	});
});
