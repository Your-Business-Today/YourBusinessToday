import { describe, expect, it } from 'vitest';
import { parityGapsOf, toolsOf, toolsServingRoute, type McpMap } from './mcpMap';
import { pairedScreensOf } from './pairedScreens';

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

	it('gathers a tool from the stories it serves', () => {
		expect(toolsOf(mcpMap)).toEqual([{ name: 'get_job', workflow: '01-jobs', stories: [jobStory], routes: ['/jobs/{id}'] }]);
	});

	it('links a tool\'s route to the site map\'s screen of the same shape', () => {
		const siteMap = { screens: [{ route: '/jobs/{Id}', viewFile: '', layout: '', section: 'jobs', entityName: null }] };
		expect(pairedScreensOf(['/jobs/{id}', '/elsewhere'], siteMap)).toEqual([
			{ route: '/jobs/{id}', siteMapRoute: '/jobs/{Id}' },
			{ route: '/elsewhere', siteMapRoute: null }
		]);
	});
});
