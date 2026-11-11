import { describe, expect, it } from 'vitest';
import { developmentPageLinks } from './developmentPages';

describe('developmentPageLinks', () => {
	const links = developmentPageLinks('harbour-site');

	it('holds the three backlogs, the scrum board, what is staged and deployed, and the site map in one row', () => {
		expect(links.map(({ label }) => label)).toEqual([
			'Bugs',
			'Features',
			'Infrastructure',
			'Board',
			'Staged',
			'Deployments',
			'Site map'
		]);
	});

	it('opens each backlog and the board on the project page, and the rest on their own pages', () => {
		expect(links.map(({ href }) => href)).toEqual([
			'/projects/harbour-site?department=bugs',
			'/projects/harbour-site?department=features',
			'/projects/harbour-site?department=infrastructure',
			'/projects/harbour-site?view=board',
			'/projects/harbour-site/staged',
			'/projects/harbour-site/deploys',
			'/projects/harbour-site/site-map'
		]);
	});
});
