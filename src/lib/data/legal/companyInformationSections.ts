import { companyDetails } from '$lib/data/companyDetails';
import { whatWeDoPath } from '$lib/data/consultancyOffer';
import type { LegalSection } from '$lib/data/legalDocument';
import { professionalInsurance } from '$lib/data/professionalInsurance';

function vatLines(): string[] {
	if (companyDetails.vatNumber === null) return [];
	return [`VAT number: ${companyDetails.vatNumber}.`];
}

const privacyLine = `How we handle personal data is set out in our privacy statement at ${companyDetails.websiteUrl}/privacy.`;

function dataProtectionParagraphs(): string[] {
	if (companyDetails.icoRegistrationNumber === null) return [privacyLine];
	return [
		`We are registered with the Information Commissioner’s Office under number ${companyDetails.icoRegistrationNumber}.`,
		privacyLine
	];
}

function insuranceParagraphs(): string[] {
	if (professionalInsurance === null) {
		return [
			`Details of our professional indemnity insurance — the insurer, the cover and its territorial scope — are available on request from ${companyDetails.consultingEmail}.`
		];
	}
	return [
		`We carry professional indemnity insurance with ${professionalInsurance.insurer}.`,
		`Cover: ${professionalInsurance.cover}. Territorial scope: ${professionalInsurance.territorialScope}.`
	];
}

function identityLine(): string {
	const { tradingName, legalName, legalForm, registeredIn } = companyDetails;
	return `${tradingName} is the trading name of ${legalName}, ${legalForm}, registered in ${registeredIn}.`;
}

export const companyInformationSections: LegalSection[] = [
	{
		heading: 'Who we are',
		paragraphs: [identityLine()],
		listItems: [
			`Company number: ${companyDetails.registrationNumber}.`,
			`Registered office: ${companyDetails.registeredAddress}.`,
			`Email: ${companyDetails.consultingEmail}.`,
			...vatLines()
		]
	},
	{
		heading: 'What we do',
		paragraphs: [
			`We learn how a business really runs, then build the software that runs it and, if the client wants us to, host and run it for them in our own Microsoft Azure, in the United Kingdom. How the work is structured is set out at ${companyDetails.websiteUrl}${whatWeDoPath}.`,
			'Our prices are not fixed in advance for every client. Discovery is a fixed price, each build stage is priced before it starts, and running the system is one monthly fee — all set out in a written offer before anything is agreed.'
		]
	},
	{
		heading: 'Professional indemnity insurance',
		paragraphs: insuranceParagraphs()
	},
	{
		heading: 'Data protection',
		paragraphs: dataProtectionParagraphs()
	},
	{
		heading: 'Terms and governing law',
		paragraphs: [
			`The terms that apply to this website and the client portal are at ${companyDetails.websiteUrl}/terms. Client work is governed by a written agreement signed before it starts.`,
			'Our terms and agreements are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction.'
		]
	}
];
