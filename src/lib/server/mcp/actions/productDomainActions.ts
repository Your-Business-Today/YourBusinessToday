import { fileProductBrainDomainGuidance, readProductBrainDomainGuidance } from './businessBrainDomainGuidance';
import { fileProductBrainDomainSchema, readProductBrainDomainSchema } from './businessBrainDomainSchemas';
import { fileProductDomain, readDomainOfProduct } from './businessBrainDomainRuns';
import { productModuleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

const businessBrainModule = 'business_brain';

export const productDomainActions: McpAction[] = [
	productModuleAction(businessBrainModule, {
		name: 'file_product_brain_domain',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary:
			"file what one source teaches about a product's own domain into its product brain in one call: the bounded contexts it creates or reshapes, the pages it writes and the pages it supersedes",
		guidance: fileProductBrainDomainGuidance,
		inputSchema: fileProductBrainDomainSchema,
		run: fileProductDomain
	}),
	productModuleAction(businessBrainModule, {
		name: 'read_product_brain_domain',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary:
			"read a product's own domain as its product brain holds it: the context map, each bounded context with the core domain marked, its entities with their fields, its other building blocks and its glossary",
		guidance: readProductBrainDomainGuidance,
		inputSchema: readProductBrainDomainSchema,
		run: readDomainOfProduct
	})
];
