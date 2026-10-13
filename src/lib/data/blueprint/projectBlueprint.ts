import type { DomainModel } from './domainModel';
import type { SiteMap } from './siteMap';

/**
 * What YBT last read of a project's product from its repository: the business domain and the site map, either
 * missing when the repository carries no file for it, with the commit they were read at.
 */
export type ProjectBlueprint = {
	domain: DomainModel | null;
	siteMap: SiteMap | null;
	readAtCommit: string;
	readAt: string;
};
