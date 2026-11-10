import { headcountBandLabels } from '$lib/data/headcountBands';
import type { Client } from '$lib/server/clients/clientRecord';

const nothingHeld = '';

/** What the register holds about the company itself, one known fact to a line, for a staff member's Claude to research from. */
export function describeCompanyProfile(client: Client): string[] {
	const { profile } = client;
	const facts = [
		knownFact('Companies House number', profile.companyNumber),
		knownFact('Registered address', client.address),
		knownFact('Industry', profile.industry),
		knownFact('Location', [profile.location, profile.postcode].filter(Boolean).join(', ')),
		knownFact('Team size', profile.headcountBand === nothingHeld ? nothingHeld : headcountBandLabels[profile.headcountBand]),
		knownFact('Summary', profile.summary),
		knownFact('Opening angles', profile.openingAngles === nothingHeld ? nothingHeld : `\n${profile.openingAngles}`),
		knownFact('Profile read from', profile.sourceUrl)
	].filter((fact) => fact !== nothingHeld);
	if (facts.length === 0) return ['Company profile: nothing researched yet.'];
	return ['Company profile:', ...facts];
}

function knownFact(label: string, value: string): string {
	if (value === nothingHeld) return nothingHeld;
	return `${label}: ${value}`;
}
