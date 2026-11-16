import type { SupabaseClient } from '@supabase/supabase-js';
import { domainOfEmail, isOurAddress } from '$lib/data/emailDomains';
import { isFreeMailDomain } from '$lib/data/freeMailDomains';
import { clientsAtDomain, findClientsByDomain, type ClientWithSite } from './findClientsByDomain';
import { findPeopleByEmail, type PersonByEmail } from './findPeopleByEmail';
import { emailOwnerKinds, type EmailOwner } from './emailOwner';

type Register = { people: PersonByEmail[]; clients: ClientWithSite[] };

/** Who each address of an email belongs to: us, a person we hold, a client whose website it comes from, or nobody. */
export async function findRecordsForEmail(supabase: SupabaseClient, addresses: string[]): Promise<EmailOwner[]> {
	const outsideAddresses = addresses.filter((address) => !isOurAddress(address));
	const people = await findPeopleByEmail(supabase, outsideAddresses);
	const unheldAddresses = outsideAddresses.filter((address) => !people.some((person) => person.email === address));
	const clients = await findClientsByDomain(supabase, companyDomainsOf(unheldAddresses));
	return addresses.map((address) => ownerOf(address, { people, clients }));
}

function companyDomainsOf(addresses: string[]): string[] {
	const domains = addresses.map(domainOfEmail).filter((domain) => !isFreeMailDomain(domain));
	return [...new Set(domains)];
}

function ownerOf(address: string, register: Register): EmailOwner {
	if (isOurAddress(address)) return { address, kind: emailOwnerKinds.us };
	const person = register.people.find(({ email }) => email === address);
	if (person !== undefined) return personOwner(address, person);
	return websiteOwner(address, register.clients);
}

function personOwner(address: string, person: PersonByEmail): EmailOwner {
	return { address, kind: emailOwnerKinds.person, personId: person.id, personName: person.name, companies: person.companies };
}

function websiteOwner(address: string, clients: ClientWithSite[]): EmailOwner {
	const domain = domainOfEmail(address);
	if (isFreeMailDomain(domain)) return { address, kind: emailOwnerKinds.nobody };
	const companies = clientsAtDomain(clients, domain);
	if (companies.length === 0) return { address, kind: emailOwnerKinds.nobody };
	return { address, kind: emailOwnerKinds.website, domain, companies };
}
