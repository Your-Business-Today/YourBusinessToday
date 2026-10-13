import type { DomainModel } from './domainModel';
import type { McpMap } from './mcpMap';
import type { SiteMap } from './siteMap';

/**
 * What YBT last read of a project's product from its repository: the business domain, the site map a person
 * browses and the MCP map a Claude works through, each missing when the repository carries nothing for it, with
 * the commit they were read at.
 */
export type ProjectBlueprint = {
	domain: DomainModel | null;
	siteMap: SiteMap | null;
	mcpMap: McpMap | null;
	readAtCommit: string;
	readAt: string;
};
