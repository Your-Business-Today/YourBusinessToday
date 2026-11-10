import { adoptBrandDecision, retireBrandDecision } from './brandDecisionStatusRuns';
import { decisionOnlySchema, defineBrandTraitSchema, describeBrandSchema, recordBrandDecisionsSchema } from './brandKitWriteSchemas';
import { defineBrandTrait, describeBrand } from './brandKitWriteRuns';
import { moduleAction } from '../organisationModuleGate';
import { recordBrandDecisions } from './recordBrandDecisionsRun';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

export const brandKitWriteActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'describe_brand',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'say what an organisation’s brand is, in a sentence or two; an organisation with no brand gets one here',
		guidance: 'An organisation has one brand, named by the organisation. Describing it again replaces the sentence, and the answer says what it read before.',
		inputSchema: describeBrandSchema,
		run: describeBrand
	}),
	moduleAction(brandModule, {
		name: 'define_brand_trait',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'add a trait of the brand’s own to its catalogue, such as a seasonal colour',
		guidance: 'Read read_brand_catalogue first: a trait the catalogue already has is decided, never defined again.',
		inputSchema: defineBrandTraitSchema,
		run: defineBrandTrait
	}),
	moduleAction(brandModule, {
		name: 'record_brand_decisions',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'record many brand decisions at once, each checked against its trait, as adopted or as proposed for a person on the organisation to adopt',
		guidance:
			'A value that does not fit its trait is refused by name and never trimmed; the others in the same call still go in. ' +
			'An adopted decision retires the one adopted before it at the same trait and medium, and that row is kept.',
		inputSchema: recordBrandDecisionsSchema,
		run: recordBrandDecisions
	}),
	moduleAction(brandModule, {
		name: 'adopt_brand_decision',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'put a proposed or retired brand decision in force, retiring the one it takes the place of',
		inputSchema: decisionOnlySchema,
		run: adoptBrandDecision
	}),
	moduleAction(brandModule, {
		name: 'retire_brand_decision',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'take a brand decision out of force; its row is kept and it can be adopted again',
		inputSchema: decisionOnlySchema,
		run: retireBrandDecision
	})
];
