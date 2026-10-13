import { describe, expect, it } from 'vitest';
import { webSearchTool } from './webSearchTool';

const mostSearches = 5;

describe('webSearchTool', () => {
	it('searches the whole web when no domains are given', () => {
		expect(webSearchTool(mostSearches)).not.toHaveProperty('allowed_domains');
	});

	it('keeps the search to the domains it is given', () => {
		expect(webSearchTool(mostSearches, ['reed.co.uk']).allowed_domains).toEqual(['reed.co.uk']);
	});
});
