import { emptyCompanyProfile, type CompanyProfile } from './companyProfile';
import { parseHeadcountBand } from '$lib/data/headcountBands';
import type { Client } from './clientRecord';
import type { CompanyResearchFindings } from '$lib/data/companyResearchRules';
import type { ReviewedLead } from './researchedProfile';

const openingAngleSeparator = '\n';

/** The findings as the register saves research: a client already listed keeps every value the findings leave blank. */
export function researchedLeadFromFindings(findings: CompanyResearchFindings, client: Client | null): ReviewedLead {
	const heldProfile = client?.profile ?? emptyCompanyProfile;
	return {
		existingClientId: client?.id ?? null,
		name: client?.name ?? findings.name,
		website: findings.website || (client?.website ?? ''),
		profile: profileKeepingWhatIsHeld(heldProfile, findings),
		people: findings.people.map((person) => ({ name: person.name, role: person.role, evidenceUrl: person.sourceUrl }))
	};
}

function profileKeepingWhatIsHeld(held: CompanyProfile, findings: CompanyResearchFindings): CompanyProfile {
	const openingAngles = findings.openingAngles.map((angle) => `- ${angle}`).join(openingAngleSeparator);
	return {
		industry: findings.industry || held.industry,
		location: findings.location || held.location,
		postcode: findings.postcode || held.postcode,
		headcountBand: parseHeadcountBand(findings.headcountBand) || held.headcountBand,
		companyNumber: findings.companyNumber || held.companyNumber,
		summary: findings.summary,
		openingAngles: openingAngles || held.openingAngles,
		sourceUrl: findings.sourceUrl
	};
}
