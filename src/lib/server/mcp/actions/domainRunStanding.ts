import { brainOf } from './businessBrainAnswers';
import { domainQuestionsOpen, mapQuestionsOpen } from './domainRunQuestions';
import { domainRunNotJoined } from './mapDomainJoinSteps';
import { entitiesOf } from '$lib/data/blueprint/domainModel';
import { mapPhrasesOf } from '$lib/data/workflowMap/mapPhrases';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { organisationModuleLabels, type OrganisationModule } from '$lib/data/organisationModules';
import { workflowMapRequest } from '$lib/data/personRequests';
import { workflowMapRunActionName } from './workflowMapRunActionName';
import type { DomainSource } from '$lib/server/businessBrain/readDomainSources';
import type { DomainWord } from '$lib/data/domainReading';
import type { OrganisationDomain } from '$lib/data/organisationDomain';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** What Your Business Today holds for the organisation that bears on its domain, as the domain run reads it first. */
export type DomainRunStanding = {
	organisation: Organisation;
	map: WorkflowMapVersion | null;
	domain: OrganisationDomain | null;
	words: DomainWord[];
	sources: DomainSource[];
	products: { id: string; name: string }[];
	switchedOn: OrganisationModule[];
};

/** Step 1 of the domain run: what is held already, the filed workflow map first, what the run should read first, and the questions both leave open. */
export function domainRunStanding(standing: DomainRunStanding): string {
	const { organisation, switchedOn } = standing;
	return [
		'1. **Say what Your Business Today holds already.**',
		mapHeld(standing),
		...mapQuestionsOpen(standing),
		domainHeld(standing),
		productsHeld(standing),
		`Switched on for ${organisation.name}: ${switchedOn.map((module) => organisationModuleLabels[module]).join(', ')}.`,
		...domainQuestionsOpen(standing)
	].join('\n');
}

function mapHeld({ organisation, map, domain, words }: DomainRunStanding): string {
	if (map === null)
		return (
			`   - The workflow map: none filed for ${organisation.name} yet. The domain is modelled from the map's own phrases, ` +
			`so offer "${workflowMapRequest}" (${workflowMapRunActionName}) first, and go on here only if the person would rather.`
		);
	return [
		`   - The workflow map: ${mapFiled(map)}. Read it whole with read_workflow_map first: the model starts from it.`,
		'   - Go through every phrase its stations take in or produce and its hand-overs pass, and say what each is: a record, a record in a status, ' +
			'a detail or an event. Each record it names is a page of its own; a phrase you cannot place is a question for the person.',
		...domainRunNotJoined(map, { things: domain?.things ?? [], words })
	].join('\n');
}

function mapFiled(map: WorkflowMapVersion): string {
	const { lines, handovers, versionNumber, stage, recordedAt } = map;
	const stations = lines.flatMap((line) => line.stations);
	const phrases = mapPhrasesOf(map);
	const sizes = `${lines.length} lines, ${stations.length} stations, ${handovers.length} hand-overs and ${phrases.length} phrases`;
	return `version ${versionNumber} of the ${mapStageNames[stage]} map, filed ${recordedAt.slice(0, 10)}: ${sizes}`;
}

function domainHeld({ organisation, domain, sources }: DomainRunStanding): string {
	if (domain === null)
		return `   - The domain: nothing yet. This is the first run, so it is a first model of how ${organisation.name} works: a page for every kind of thing it keeps.`;
	const { contexts, model } = domain;
	const core = contexts.find((context) => context.isCoreDomain);
	const coreWords = core === undefined ? 'no core domain marked yet' : `${core.title} the core domain`;
	const filedFrom = sources.map((source) => `${source.title} (${source.filedAt.slice(0, 10)})`).join('; ');
	return [
		`   - The domain in ${brainOf(organisation)}: ${contexts.length} contexts, ${coreWords}, ${entitiesOf(model).length} entities. Read it whole with read_business_brain_domain before anything else, and build on it.`,
		`   - Filed from: ${filedFrom || 'no source named'}. Read a source again only when it has changed.`
	].join('\n');
}

function productsHeld({ products }: DomainRunStanding): string {
	if (products.length === 0) return '   - Products: none open to you.';
	const named = products.map((product) => `${product.name} (${product.id})`).join(', ');
	return `   - Products: ${named}. Each one's domain is read with read_project_domain; take the business's words from them, but model the business, not the software.`;
}
