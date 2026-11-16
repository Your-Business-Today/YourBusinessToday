const wordBreaks = /[\s-]+/g;
const categoryWordJoin = '_';

/**
 * What a person asks for, as Overture Maps writes a category: in lower case, with an underscore where a person
 * leaves a space or a hyphen, so estate agent finds real_estate_agent.
 */
export function asPlaceCategory(askedFor: string): string {
	return askedFor.trim().toLowerCase().replace(wordBreaks, categoryWordJoin);
}
