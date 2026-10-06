export type CreditPackDefinition = {
	id: string;
	name: string;
	credits: number;
	pricePence: number;
};

/**
 * The packs on sale, mirrored by the credit_packs table — getCreditPacks
 * refuses to serve a table that disagrees, because every usage price below
 * is derived from the cheapest rate here.
 */
export const creditPacks: CreditPackDefinition[] = [
	{ id: 'starter', name: 'Starter', credits: 500, pricePence: 299 },
	{ id: 'growth', name: 'Growth', credits: 1200, pricePence: 599 },
	{ id: 'scale', name: 'Scale', credits: 3000, pricePence: 1299 }
];

export function pencePerCredit(pack: CreditPackDefinition): number {
	return pack.pricePence / pack.credits;
}

export const cheapestCreditPack = creditPacks.reduce((cheapest, pack) =>
	pencePerCredit(pack) < pencePerCredit(cheapest) ? pack : cheapest
);

/**
 * What one credit is worth to the business: the cheapest pack's rate, so a
 * price that clears cost at this value clears it whichever pack was bought.
 */
export const creditValuePence = pencePerCredit(cheapestCreditPack);
