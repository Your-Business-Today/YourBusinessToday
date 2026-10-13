import { blueprintSources } from '$lib/data/blueprint/blueprintSources';

/** What a page says when the repository has given it nothing to show. */
export const blueprintEmptyMessages = {
	noRepository: 'This project has no repository recorded. Add it with Edit on the project, then read it from GitHub.',
	noDomain:
		`No domain read yet. The repository needs ${blueprintSources.entityManifestPath}; ` +
		'read it from GitHub once it is there.',
	noSiteMap:
		`No site map read yet. The repository needs ${blueprintSources.siteDefinitionPath}, which the code quality check ` +
		'and the widget identification write; read it from GitHub once it is there.'
} as const;
