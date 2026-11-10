import type { CompanyProfile } from './companyProfile';

export type ResearchedPerson = { name: string; role: string; evidenceUrl: string };

export type ResearchedProfile = {
	name: string;
	website: string;
	profile: CompanyProfile;
	people: ResearchedPerson[];
};

/** Research ready for the register: a new lead when existingClientId is null, else the client it updates. */
export type ReviewedLead = ResearchedProfile & { existingClientId: string | null };
