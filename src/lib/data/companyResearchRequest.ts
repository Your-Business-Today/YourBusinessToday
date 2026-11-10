/** The company a staff member wants researched: one already on the register carries its client id. */
export type CompanyToResearch = { name: string; clientId: string | null };

export const unnamedCompany = '[company name or website]';

/** What a staff member says to their own Claude, so it researches the company and saves the findings to the register. */
export function companyResearchRequest(company: CompanyToResearch): string {
	const named = company.name === '' ? unnamedCompany : company.name;
	const onRegister = company.clientId === null ? '' : ` (client ${company.clientId} on the register)`;
	return (
		`Research ${named}${onRegister} for the Your Business Today clients register. Find its own ` +
		'website and read its public business pages, show me what you find, then save it with ' +
		'save_company_research.'
	);
}
