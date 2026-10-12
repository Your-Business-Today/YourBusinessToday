/** How many companies registered at one address make it a registered-office hub rather than a business. */
export const companiesAtOneAddressThatMakeAHub = 20;

/** Account categories Companies House gives a company that trades nowhere. */
export const nonTradingAccountCategories = ['DORMANT', 'NO ACCOUNTS FILED'];

export function isNonTradingCategory(accountCategory: string): boolean {
	return nonTradingAccountCategories.includes(accountCategory.trim().toUpperCase());
}

/** A pin holding one company is a business; one holding many is a registered-office hub. */
export const oneCompany = 1;

export function isHub(pin: { companyCount: number }): boolean {
	return pin.companyCount > oneCompany;
}
