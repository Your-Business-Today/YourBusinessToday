/** The company whose adverts a staff member wants found: one on the register carries its client id, so they can be kept. */
export type CompanyToSearchForAdverts = { name: string; place: string; clientId: string | null };

/** What a staff member says to their own Claude, so it finds the company's job adverts and, when it is on the register, keeps them. */
export function jobAdvertRequest(company: CompanyToSearchForAdverts): string {
	const where = company.place === '' ? '' : ` in ${company.place}`;
	const ask = `Find the open job adverts of ${company.name}${where} on the UK job boards Your Business Today reads, never LinkedIn`;
	if (company.clientId === null) return `${ask}, and show me what you find. It is not on the clients register, so nothing is saved.`;
	return `${ask}. It is client ${company.clientId} on the clients register: show me what you find, then save it with save_company_job_adverts.`;
}
