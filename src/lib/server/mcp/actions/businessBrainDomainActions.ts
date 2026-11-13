import { domainCheckActionName } from './domainCheckActionName';
import { domainRunActionName } from './domainRunActionName';
import { fileBusinessBrainDomainGuidance, readBusinessBrainDomainGuidance, startDomainCheckGuidance, startDomainRunGuidance } from './businessBrainDomainGuidance';
import { fileBusinessBrainDomainSchema, readBusinessBrainDomainSchema } from './businessBrainDomainSchemas';
import { fileDomain, readDomain, startDomainCheck, startDomainRun } from './businessBrainDomainRuns';
import { moduleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

const businessBrainModule = 'business_brain';

export const businessBrainDomainActions: McpAction[] = [
	moduleAction(businessBrainModule, {
		name: 'file_business_brain_domain',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: true,
		summary:
			"file what one source teaches about an organisation's own domain into its Your Business Brain in one call: the bounded contexts it creates or reshapes, the pages it writes (things, rules and glossaries among them) and the pages it supersedes",
		guidance: fileBusinessBrainDomainGuidance,
		inputSchema: fileBusinessBrainDomainSchema,
		run: fileDomain
	}),
	moduleAction(businessBrainModule, {
		name: 'read_business_brain_domain',
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary:
			"read an organisation's own domain as its Your Business Brain holds it: the context map, each bounded context with the core domain marked, its entities with their fields, its other building blocks with what each event marks and who reacts, its rules with their kinds and what each sits on, its glossary, and the questions it still leaves open, most important first",
		guidance: readBusinessBrainDomainGuidance,
		inputSchema: readBusinessBrainDomainSchema,
		run: readDomain
	}),
	moduleAction(businessBrainModule, {
		name: domainRunActionName,
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary:
			"start a run that sets an organisation's own domain: the steps to follow, fitted to what Your Business Today already holds, to gather from the connectors in the chat and model the business",
		guidance: startDomainRunGuidance,
		inputSchema: readBusinessBrainDomainSchema,
		run: startDomainRun
	}),
	moduleAction(businessBrainModule, {
		name: domainCheckActionName,
		area: 'business_brain',
		audience: 'everyone',
		isWrite: false,
		summary:
			"start a check of an organisation's own domain for its faults: the candidates the site finds (near-duplicates, words used two ways, names against the rules, rules inside meanings, misfiled pages, things nothing touches, thin pages and loose references) and the walk to judge and repair them on the person's yes",
		guidance: startDomainCheckGuidance,
		inputSchema: readBusinessBrainDomainSchema,
		run: startDomainCheck
	})
];
