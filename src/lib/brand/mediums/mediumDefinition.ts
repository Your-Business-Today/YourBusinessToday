import type { FacetKey } from '../facets';

export const everywherePath = 'all';

export type MediumDefinition = {
	path: string;
	label: string;
	facets?: FacetKey[];
	actions?: string[];
	addsActions?: string[];
};

export type Medium = {
	path: string;
	label: string;
	parentPath: string | null;
	facets: FacetKey[];
	actions: string[];
};
