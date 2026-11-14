import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
	portalPageInsteadOf,
	sectionsServedOnlyAtThePortal,
	signedInOriginSeenFrom
} from './mainSiteAddress';
import { salesRegisterSegments } from '$lib/data/salesRegisters';

const routesDirectory = join(import.meta.dirname, '../../routes');

/** What the main site keeps: its public pages, and the doors things outside the site call at its address. */
const sectionsKeptOnTheMainSite = new Set([
	'.well-known',
	'about',
	'api',
	'auth',
	'case-studies',
	'case-study',
	'company',
	'construction-demo',
	'contact',
	'demo',
	'jewel-demo',
	'oauth',
	'offer',
	'privacy',
	'promo',
	'sitemap.xml',
	'tax-calculator',
	'terms',
	'upload',
	'vision',
	'what-we-do'
]);

/** A directory named by a matcher stands for every section the matcher takes: a company's page is under Leads or Clients. */
const sectionsOfMatchedDirectories: Record<string, string[]> = {
	'[register=salesRegister]': salesRegisterSegments
};

function routeSections(): string[] {
	return readdirSync(routesDirectory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.flatMap(({ name }) => sectionsOfMatchedDirectories[name] ?? [name]);
}

describe('portalPageInsteadOf', () => {
	it('sends a signed-in page at the main site to the same path and query on the portal', () => {
		const projects = new URL('https://www.yourbusiness.today/projects?tab=live');
		expect(portalPageInsteadOf(projects)).toBe('https://portal.yourbusiness.today/projects?tab=live');
		const signIn = new URL('https://yourbusiness.today/account/sign-in?next=%2Fportal');
		expect(portalPageInsteadOf(signIn)).toBe('https://portal.yourbusiness.today/account/sign-in?next=%2Fportal');
	});

	it('keeps the public pages and the outside doors on the main site', () => {
		const kept = ['/', '/what-we-do', '/api/mcp', '/oauth/authorize?x=1', '/.well-known/oauth-authorization-server', '/upload/t1', '/demo/t1', '/auth/callback', '/_app/immutable/x.js', '/accounting'];
		const answers = kept.map((path) => portalPageInsteadOf(new URL(`https://www.yourbusiness.today${path}`)));
		expect(answers.every((answer) => answer === null)).toBe(true);
	});

	it('leaves the portal itself, previews and a local run alone', () => {
		const elsewhere = ['https://portal.yourbusiness.today/projects', 'https://ybt-git-staging.vercel.app/projects', 'http://localhost:5173/projects'];
		const answers = elsewhere.map((address) => portalPageInsteadOf(new URL(address)));
		expect(answers.every((answer) => answer === null)).toBe(true);
	});

	it('knows of every section of the site, so a new one is placed on purpose', () => {
		const unplaced = routeSections().filter(
			(section) => !sectionsServedOnlyAtThePortal.has(section) && !sectionsKeptOnTheMainSite.has(section)
		);
		expect(unplaced).toEqual([]);
	});
});

describe('signedInOriginSeenFrom', () => {
	it('points the main site at the portal and anywhere else at itself', () => {
		expect(signedInOriginSeenFrom(new URL('https://www.yourbusiness.today/contact'))).toBe('https://portal.yourbusiness.today');
		expect(signedInOriginSeenFrom(new URL('https://ybt-git-staging.vercel.app/contact'))).toBe('https://ybt-git-staging.vercel.app');
	});
});
