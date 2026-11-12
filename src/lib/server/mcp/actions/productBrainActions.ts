import { changeProductBrainGuidance, readProductBrainIndexGuidance, readProductBrainPageGuidance, searchProductBrainGuidance } from './productBrainGuidance';
import { changeProductBrainSchema, readProductBrainIndexSchema, readProductBrainPageSchema, searchProductBrainSchema } from './productBrainSchemas';
import { changeProductBrain } from './productBrainRuns';
import { moduleAction, productModuleAction } from '../organisationModuleGate';
import { readIndexOfProductBrain, readPageOfProductBrain, searchProductBrain } from './productBrainReadingRuns';
import type { McpAction } from '../actionTypes';

const businessBrainModule = 'business_brain';

const readingAction = { area: 'business_brain', audience: 'everyone', isWrite: false } as const;

export const productBrainActions: McpAction[] = [
	moduleAction(businessBrainModule, {
		name: 'change_product_brain',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary: "tie parts of an organisation's Your Business Brain to one of its products, or untie them, as its manager",
		guidance: changeProductBrainGuidance,
		inputSchema: changeProductBrainSchema,
		run: changeProductBrain
	}),
	productModuleAction(businessBrainModule, {
		...readingAction,
		name: 'read_product_brain_index',
		summary: "list the pages of a product's brain, the parts of its organisation's Your Business Brain tied to it, by part and title",
		guidance: readProductBrainIndexGuidance,
		inputSchema: readProductBrainIndexSchema,
		run: readIndexOfProductBrain
	}),
	productModuleAction(businessBrainModule, {
		...readingAction,
		name: 'search_product_brain',
		summary: "search the pages of a product's brain for words, best match first, with an excerpt of each",
		guidance: searchProductBrainGuidance,
		inputSchema: searchProductBrainSchema,
		run: searchProductBrain
	}),
	productModuleAction(businessBrainModule, {
		...readingAction,
		name: 'read_product_brain_page',
		summary: "read one page of a product's brain whole, with the related pages it also holds and its history, or one earlier version",
		guidance: readProductBrainPageGuidance,
		inputSchema: readProductBrainPageSchema,
		run: readPageOfProductBrain
	})
];
