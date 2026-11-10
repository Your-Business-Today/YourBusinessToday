import { organisationModuleRouteSegments } from './organisationModules';

/** The address query that names an earlier version of a page. */
export const revisionQueryKey = 'revision';

const revisionIdPattern = /^[1-9][0-9]{0,14}$/;

/** Whether the address names an earlier version as its history numbers them. */
export function isRevisionId(candidate: string): boolean {
	return revisionIdPattern.test(candidate);
}

/** Where an organisation's Your Business Brain, its pages, their earlier versions and its kept files are read on the site. */
export function businessBrainAddresses(organisationId: string) {
	const home = `/organisations/${organisationId}/${organisationModuleRouteSegments.business_brain}`;
	return {
		home,
		page: (pageId: string) => `${home}/pages/${pageId}`,
		revision: (pageId: string, revisionId: number) => `${home}/pages/${pageId}?${revisionQueryKey}=${revisionId}`,
		file: (fileId: string) => `${home}/files/${fileId}`
	};
}

export type BusinessBrainAddresses = ReturnType<typeof businessBrainAddresses>;
