/** A company as the advanced search lists it, registered in the postcode given. */
export function searchedCompany(companyNumber: string, postcode: string, incorporatedOn: string): Record<string, unknown> {
	return {
		company_number: companyNumber,
		company_name: `Company ${companyNumber}`,
		company_status: 'active',
		date_of_incorporation: incorporatedOn,
		registered_office_address: { address_line_1: '1 High Street', postal_code: postcode },
		sic_codes: ['62012']
	};
}

export function searchAnswer(companies: Record<string, unknown>[]): Response {
	return Response.json({ items: companies, hits: companies.length });
}

export function refusalAnswer(status: number): Response {
	return new Response('{}', { status });
}

/** A stand-in for Companies House: every call is answered by the rule given, read from the address asked. */
export function companiesHouseAnswering(answerFor: (address: URL) => Response) {
	return async (address: URL | string) => answerFor(new URL(String(address)));
}
