/** Where an optional clause sits when a pack chooses it: after the MSA's entire agreement clause, or in the Order Form's changes to the MSA. */
export const clausePlaces = {
	afterEntireAgreement: { documentSlug: 'master-services-agreement', anchor: '16.4 **Entire agreement.**' },
	orderFormChanges: { documentSlug: 'order-form', anchor: '[None.] _(The optional clauses chosen for this order' }
} as const;

export type ClausePlace = (typeof clausePlaces)[keyof typeof clausePlaces];

/** A clause kept apart from the standard text, chosen for a client's pack or left out of it. */
export type ContractOptionalClause = {
	slug: string;
	title: string;
	summary: string;
	place: ClausePlace;
	isChosenByDefault: boolean;
	needsClause?: string;
};

export const contractOptionalClauses: readonly ContractOptionalClause[] = [
	{
		slug: 'earlier-nda',
		title: 'Earlier confidentiality agreement (MSA 16.4A)',
		summary: 'The MSA replaces a mutual NDA the client signed earlier, and what was shared under it is covered.',
		place: clausePlaces.afterEntireAgreement,
		isChosenByDefault: false
	},
	{
		slug: 'ybt-owns-the-software',
		title: 'Ownership and licence',
		summary:
			'YBT owns the software it builds and licenses it to the client, in place of MSA clause 9.1; the client owns its data.',
		place: clausePlaces.orderFormChanges,
		isChosenByDefault: true
	},
	{
		slug: 'minimum-term',
		title: 'Minimum term',
		summary: 'The Run service lasts a minimum number of months, then runs on until notice.',
		place: clausePlaces.orderFormChanges,
		isChosenByDefault: false
	},
	{
		slug: 'buy-out',
		title: 'Buy-out',
		summary: 'The client may buy a perpetual licence with the source code, at a multiple of the monthly fee.',
		place: clausePlaces.orderFormChanges,
		isChosenByDefault: false,
		needsClause: 'ybt-owns-the-software'
	},
	{
		slug: 'yearly-cpi-increase',
		title: 'Yearly increase',
		summary: 'The monthly fee rises each year by the Consumer Prices Index, up to a cap.',
		place: clausePlaces.orderFormChanges,
		isChosenByDefault: false
	},
	{
		slug: 'user-and-storage-limits',
		title: 'User and storage limits',
		summary: 'The monthly fee covers a number of named users and gigabytes of stored data.',
		place: clausePlaces.orderFormChanges,
		isChosenByDefault: false
	}
];

export function optionalClausesFor(documentSlug: string): ContractOptionalClause[] {
	return contractOptionalClauses.filter(({ place }) => place.documentSlug === documentSlug);
}

export function findOptionalClause(slug: string): ContractOptionalClause | undefined {
	return contractOptionalClauses.find((clause) => clause.slug === slug);
}

export const defaultClauseSlugs = contractOptionalClauses
	.filter((clause) => clause.isChosenByDefault)
	.map((clause) => clause.slug);

/** Why a choice of optional clauses cannot make a pack, naming the clause; null when it can. */
export function validateChosenClauses(slugs: readonly string[]): string | null {
	const unknown = slugs.find((slug) => findOptionalClause(slug) === undefined);
	if (unknown !== undefined) return `There is no optional clause "${unknown}". The clauses are: ${everyClauseSlug}.`;
	const orphan = slugs.map(findOptionalClause).find((clause) => isMissingItsClause(clause, slugs));
	if (orphan === undefined) return null;
	return `The clause "${orphan.slug}" needs "${orphan.needsClause}" chosen with it.`;
}

const everyClauseSlug = contractOptionalClauses.map((clause) => clause.slug).join(', ');

function isMissingItsClause(clause: ContractOptionalClause | undefined, slugs: readonly string[]): boolean {
	if (clause?.needsClause === undefined) return false;
	return !slugs.includes(clause.needsClause);
}
