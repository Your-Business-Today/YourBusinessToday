import { organisationDomainRequest } from '$lib/data/personRequests';

/** What the organisation's Domain page says about the domain it draws, and when it has none to draw. */
export function organisationDomainMessages(organisationName: string) {
	return {
		introduction:
			`${organisationName}'s own domain, as its Claude has modelled it into Your Business Brain: ` +
			'the areas of the business, the things it deals in and how they relate.',
		brainClosed:
			`Your Business Brain is not switched on for ${organisationName}, or not open to you. ` +
			'Its domain is kept in the brain, so it shows here once the brain is on.',
		noDomain:
			`No domain has been filed for ${organisationName} yet. Ask your Claude to "${organisationDomainRequest}": ` +
			'it gathers what your connectors hold, models the business and writes nothing until you say yes.'
	};
}
