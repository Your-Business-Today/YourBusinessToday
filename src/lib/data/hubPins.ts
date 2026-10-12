/** A pin holding one company is a business; one holding many is a registered-office hub. */
export const oneCompany = 1;

export function isHub(pin: { companyCount: number }): boolean {
	return pin.companyCount > oneCompany;
}
