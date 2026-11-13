/** The read action that starts a product's "map the site" run, named wherever a Claude is pointed to it. */
export const siteMapRunActionName = 'start_site_map_run';

/** The two read-only doors onto a product's own repository, for a Claude with no GitHub of its own. */
export const repositoryDoorNames = {
	listFolder: 'list_product_repository_folder',
	readFile: 'read_product_repository_file'
} as const;
