import { describe, expect, it } from 'vitest';
import { developmentPageLinks } from './developmentPages';

describe('developmentPageLinks', () => {
	const links = developmentPageLinks('harbour-site');

	it('holds the three backlogs, what is staged and deployed, and the site map in one row', () => {
		expect(links.map(({ label }) => label)).toEqual([
			'Bugs',
			'Features',
			'Infrastructure',
			'Staged',
			'Deployments',
			'Site map'
		]);
	});

	it('opens each backlog on the project page, and the rest on their own pages', () => {
		expect(links.map(({ href }) => href)).toEqual([
			'/projects/harbour-site?department=bugs',
			'/projects/harbour-site?department=features',
			'/projects/harbour-site?department=infrastructure',
			'/projects/harbour-site/staged',
			'/projects/harbour-site/deploys',
			'/projects/harbour-site/site-map'
		]);
	});

	it('shows how many items a counted tab holds, and nothing on an empty or uncounted tab', () => {
		const counted = developmentPageLinks('harbour-site', { bugs: 2, features: 0, infrastructure: 5, staged: 3 });
		expect(counted.map(({ count }) => count)).toEqual([2, null, 5, 3, null, null]);
	});

	it('shows open bugs as a warning and every other count plainly', () => {
		const counted = developmentPageLinks('harbour-site', { bugs: 1, features: 4 });
		expect(counted.slice(0, 2).map(({ countTone }) => countTone)).toEqual(['negative', 'neutral']);
	});
});
