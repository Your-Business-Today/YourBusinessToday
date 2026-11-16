import { longestOrganisationName } from '$lib/data/organisationRules';
import type { OrganisationLink } from './leadOrganisationRows';
import type { Refusal } from '$lib/server/portal/portalFormReading';

type Company = { name: string };

export const leadOrganisationRefusals = {
	noSuchCompany: { refusal: 'No company on the register has that id. Call list_clients to see them.' },
	noSuchOrganisation: { refusal: 'No organisation has that id. Call list_organisations to see them.' },
	nameTooLong: {
		refusal: `The company’s name becomes its organisation’s name, which is at most ${longestOrganisationName} characters. Shorten the name on the register first.`
	},
	companyHasAnother: (company: Company, linked: OrganisationLink): Refusal => ({
		refusal: `${company.name} already has its own organisation, ${linked.name} (id ${linked.id}). A company has one organisation.`
	}),
	linkedElsewhere: (organisation: OrganisationLink): Refusal => ({
		refusal: `The organisation ${organisation.name} is already linked to another company. Give the organisationId of one linked to nothing, or correct the company’s name.`
	}),
	nameTaken: (company: Company): Refusal => ({
		refusal: `Another organisation is already called ${company.name}. Give its organisationId to link it, or rename one of them.`
	})
};
