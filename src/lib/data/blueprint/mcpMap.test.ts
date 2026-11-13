import { describe, expect, it } from 'vitest';
import { parityGapsOf, toolsServingRoute, type McpMap } from './mcpMap';
import { screenAtRoute } from './siteMap';

const jobStory = { id: 'US-01', workflow: '01-jobs', story: 'See a job', toolNames: ['get_job'], routes: ['/jobs/{id}'] };
const quoteStory = { id: 'US-02', workflow: '02-quotes', story: 'Send a quote', toolNames: [], routes: ['/quotes'] };
const mcpMap: McpMap = { stories: [jobStory, quoteStory], skills: [], agents: [] };

describe('the MCP map', () => {
	it('pairs a screen with the tools of every story that names its route, whatever its parameters are called', () => {
		expect(toolsServingRoute(mcpMap, '/jobs/{Id}')).toEqual(['get_job']);
	});

	it('finds the stories a person can do and a Claude cannot', () => {
		expect(parityGapsOf(mcpMap).map((story) => story.id)).toEqual(['US-02']);
	});

	it('finds the site map\'s screen of the same shape, however its parameters are written', () => {
		const screen = { route: '/jobs/[jobId]', viewFile: '', layout: '', section: 'jobs', entityName: null };
		const siteMap = { screens: [screen] };
		expect(screenAtRoute(siteMap, '/jobs/{id}')).toEqual(screen);
		expect(screenAtRoute(siteMap, '/elsewhere')).toBeUndefined();
	});
});
