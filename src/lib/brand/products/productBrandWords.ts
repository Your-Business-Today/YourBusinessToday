const changedThroughConnector = 'Your Claude changes it through the Your Business Today connector; this page shows it.';

/** What a product's brand page says of the brand above its kit. */
export function productBrandIntroOf(organisationName: string, productName: string, summary: string | null): string {
	const followsOrganisation = `Wherever ${productName} decides nothing, ${organisationName}’s brand holds.`;
	if (summary === null) return `${productName} has no brand of its own yet, so this is ${organisationName}’s. ${changedThroughConnector}`;
	return `${summary} ${followsOrganisation} ${changedThroughConnector}`;
}
