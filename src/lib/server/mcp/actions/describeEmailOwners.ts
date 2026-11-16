import { clientStageLabels } from '$lib/data/clientLifecycle';
import { companyDetails } from '$lib/data/companyDetails';
import { emailOwnerKinds, type EmailCompany, type EmailOwner } from '$lib/server/filedEmails/emailOwner';

export const nobodyWeHold = 'nobody we hold — a possible new lead';

const oneAddress = 1;

/** Who each address of an email belongs to, one line an address, in the order they were given. */
export function describeEmailOwners(owners: EmailOwner[]): string {
	const heading = owners.length === oneAddress ? 'Who this address belongs to:' : `Who these ${owners.length} addresses belong to:`;
	return [heading, ...owners.map((owner) => `- ${owner.address} — ${describeOwner(owner)}`)].join('\n');
}

function describeOwner(owner: EmailOwner): string {
	if (owner.kind === emailOwnerKinds.us) return `us, an address of ${companyDetails.tradingName}'s own`;
	if (owner.kind === emailOwnerKinds.person) return `${owner.personName} (person ${owner.personId}), ${describeContactAt(owner.companies)}`;
	if (owner.kind === emailOwnerKinds.website) return `no one we hold by this address, but ${owner.domain} is the website of ${describeCompanies(owner.companies)}`;
	return nobodyWeHold;
}

function describeContactAt(companies: EmailCompany[]): string {
	if (companies.length === 0) return 'a contact at no client or lead yet';
	return `a contact at ${describeCompanies(companies)}`;
}

function describeCompanies(companies: EmailCompany[]): string {
	return companies.map((company) => `${company.name} (${clientStageLabels[company.stage]}, client ${company.id})`).join('; ');
}
