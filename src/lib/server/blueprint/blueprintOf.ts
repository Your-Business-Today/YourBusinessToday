import { parseSiteDefinition } from './parseSiteDefinition';
import { readEntityManifest } from './entityManifest';
import { translateEntityManifest } from './translateEntityManifest';
import type { ProjectBlueprint } from '$lib/data/blueprint/projectBlueprint';

/** The blueprint the two files describe; either file may be absent or not in the shape expected. */
export function blueprintOf(manifestText: string, siteDefinitionText: string, ref: string): ProjectBlueprint {
	const manifest = readEntityManifest(manifestText);
	const entityRoutes = manifest?.routes ?? {};
	return {
		domain: manifest === null ? null : translateEntityManifest(manifest),
		siteMap: parseSiteDefinition(siteDefinitionText, entityRoutes),
		mcpMap: null,
		readAtCommit: ref,
		readAt: new Date().toISOString()
	};
}
