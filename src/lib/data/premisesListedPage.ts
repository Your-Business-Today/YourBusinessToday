const nothingListed = '';

/** The page a premises lists, where the company made from it has not taken that page as its own website; nothing where it has, or where the premises lists none. */
export function pageListedBeside(companyWebsite: string, listedPage: string): string {
	return listedPage === companyWebsite ? nothingListed : listedPage;
}
