/** What a tab says when the company has no organisation of its own yet, with the prompt to copy for the person's Claude. */
export function noLeadOrganisationWords(companyName: string, clientId: string) {
	return {
		message:
			`${companyName} has no organisation of its own yet, so nothing has been built for them here. ` +
			'Open its organisation, then ask your Claude to set its domain and map its workflows.',
		prompt:
			`Open the organisation for ${companyName} (client id ${clientId}) on Your Business Today, ` +
			'then set its domain and map its workflows. Show me what you find before filing anything.'
	};
}
