import type { CompanyIdentity } from './companyIdentity';

export function companyWebsiteSearchBrief(company: CompanyIdentity): string {
	const knownFacts = [
		`Company name: ${company.name}`,
		knownFact('Companies House number', company.companyNumber),
		knownFact('Registered address', company.registeredAddress)
	].filter((fact) => fact !== '');
	return ['Find the official website of this UK company.', ...knownFacts].join('\n');
}

function knownFact(label: string, value: string): string {
	const known = value.trim();
	if (known === '') return '';
	return `${label}: ${known}`;
}
