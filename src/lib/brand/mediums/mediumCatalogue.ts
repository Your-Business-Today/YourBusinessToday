import { everyAction } from '../actions/actionCatalogue';
import { facetKeys } from '../facets';
import { channelMediums } from './channelMediums';
import { familyMediums } from './familyMediums';
import { everywherePath, type Medium, type MediumDefinition } from './mediumDefinition';
import { isWithinPath, parentPathOf } from './mediumPaths';

const everywhere: Medium = {
	path: everywherePath,
	label: 'Everywhere',
	parentPath: null,
	facets: [...facetKeys],
	actions: everyAction.map((action) => action.key)
};

function buildMediums(definitions: MediumDefinition[]): Medium[] {
	const built = new Map<string, Medium>([[everywherePath, everywhere]]);
	for (const definition of definitions) {
		built.set(definition.path, inherit(definition, built.get(parentPathOf(definition.path))));
	}
	return [...built.values()];
}

function inherit(definition: MediumDefinition, parent: Medium | undefined): Medium {
	if (parent === undefined) throw new Error(`${definition.path} is listed before its parent`);
	const actions = definition.actions ?? parent.actions;
	return {
		path: definition.path,
		label: definition.label,
		parentPath: parent.path,
		facets: definition.facets ?? parent.facets,
		actions: [...actions, ...(definition.addsActions ?? [])]
	};
}

export const mediums: Medium[] = buildMediums([...familyMediums, ...channelMediums]);

export function findMedium(path: string): Medium | null {
	return mediums.find((medium) => medium.path === path) ?? null;
}

export function mediumsWithin(scopePath: string): Medium[] {
	return mediums.filter((medium) => isWithinPath(medium.path, scopePath));
}

