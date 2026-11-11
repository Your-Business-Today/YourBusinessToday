import { searchMyBrains } from './myBrainsRuns';
import { searchMyBrainsGuidance } from './myBrainsGuidance';
import { searchMyBrainsSchema } from './myBrainsSchemas';
import type { McpAction } from '../actionTypes';

export const myBrainsActions: McpAction[] = [
	{
		name: 'search_my_brains',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary: 'search every brain you reach at once, organisations, products and named brains, and see which hold something on a question',
		guidance: searchMyBrainsGuidance,
		inputSchema: searchMyBrainsSchema,
		run: searchMyBrains
	}
];
