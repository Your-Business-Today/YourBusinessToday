import type { Client } from './clientRecord';

export type CompanyIdentity = { name: string; companyNumber: string; registeredAddress: string };

const addressPartSeparator = ', ';

export function companyIdentityNamed(name: string): CompanyIdentity {
	return { name, companyNumber: '', registeredAddress: '' };
}

export function companyIdentityOf(client: Client): CompanyIdentity {
	const { profile } = client;
	const profileAddress = [profile.location, profile.postcode].filter((part) => part !== '');
	return {
		name: client.name,
		companyNumber: profile.companyNumber,
		registeredAddress: client.address || profileAddress.join(addressPartSeparator)
	};
}
