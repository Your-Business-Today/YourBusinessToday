import { entitiesOf } from '$lib/data/blueprint/domainModel';
import { screenCountOf } from '$lib/data/blueprint/siteMap';
import { blueprintReadingKinds, type BlueprintReading } from './readProjectBlueprint';
import { blueprintSources } from '$lib/data/blueprint/blueprintSources';

const sentences = {
	[blueprintReadingKinds.noRepository]: 'This project has no repository recorded, so there is nothing to read. Add it with Edit.',
	[blueprintReadingKinds.unreadable]:
		'The repository could not be read. A private repository needs GITHUB_TOKEN set on the site.',
	[blueprintReadingKinds.nothingFound]: `The repository carries neither ${blueprintSources.entityManifestPath} nor ${blueprintSources.siteDefinitionPath}.`
} as const;

/** One sentence on what a reading of the repository found. */
export function describeBlueprintReading(reading: BlueprintReading): string {
	if (reading.kind !== blueprintReadingKinds.read) return sentences[reading.kind];
	const { domain, siteMap } = reading.blueprint;
	const entityCount = domain === null ? 0 : entitiesOf(domain).length;
	const screenCount = siteMap === null ? 0 : screenCountOf(siteMap);
	return `Read ${entityCount} entities and ${screenCount} screens from the repository.`;
}
