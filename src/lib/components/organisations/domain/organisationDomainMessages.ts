import { organisationDomainRequest } from '$lib/data/personRequests';

/** What the organisation's Domain page says about the domain it shows, and when it has none to show. */
export function organisationDomainMessages(organisationName: string) {
	return {
		introduction:
			`${organisationName}'s own domain, as its Claude has found it and kept it in Your Business Brain: ` +
			'the things the business deals in, the rules about them and its own words.',
		brainClosed:
			`Your Business Brain is not switched on for ${organisationName}, or not open to you. ` +
			'Its domain is kept in the brain, so it shows here once the brain is on.',
		noDomain:
			`No domain has been filed for ${organisationName} yet. Ask your Claude to "${organisationDomainRequest}": ` +
			'it gathers what your connectors hold, finds the things, rules and words of the business and writes nothing until you say yes.',
		noRules: `No rule has been filed for ${organisationName} yet. Ask your Claude to "${organisationDomainRequest}" again to find them.`
	};
}
