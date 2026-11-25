/** Where a pack takes a blank's value from: the client organisation's details, the lead's quote, or what is written into the pack. */
export const blankSources = { organisation: 'organisation', quote: 'quote', pack: 'pack' } as const;

export type BlankSource = (typeof blankSources)[keyof typeof blankSources];

/** A blank in a contract template that a client's pack fills: the label it carries in square brackets and where its value comes from. */
export type ContractBlank = {
	label: string;
	source: BlankSource;
	organisationDetail?: string;
	meaning: string;
};

const fromOrganisation = (label: string, organisationDetail: string, meaning: string): ContractBlank => ({
	label,
	source: blankSources.organisation,
	organisationDetail,
	meaning
});

const fromQuote = (label: string, meaning: string): ContractBlank => ({ label, source: blankSources.quote, meaning });

const writtenInPack = (label: string, meaning: string): ContractBlank => ({ label, source: blankSources.pack, meaning });

export const contractBlanks: readonly ContractBlank[] = [
	fromOrganisation('Client legal name', 'legalName', 'The client’s registered name'),
	fromOrganisation('Client registered in', 'registeredIn', 'The country it is registered in'),
	fromOrganisation('Client company number', 'companyNumber', 'Its company number'),
	fromOrganisation('Client registered office', 'registeredOffice', 'Its registered office address'),
	fromOrganisation('Client signatory', 'signatoryName', 'Who signs for the client'),
	fromOrganisation('Client signatory\'s position', 'signatoryPosition', 'The signatory’s position'),
	fromOrganisation('Client signatory\'s email', 'signatoryEmail', 'Where the pack is sent to be signed'),
	fromOrganisation('Client notices email', 'noticesEmail', 'Where notices under the contract are sent'),
	fromQuote('Build stage fee', 'The fixed fee of the build stage the Order Form orders'),
	fromQuote('Run service monthly fee', 'The monthly fee of the Run service'),
	fromQuote('Day rate', 'The day rate for additional work'),
	writtenInPack('Date of the MSA', 'The day the MSA is signed'),
	writtenInPack('Order number', 'The Order Form’s number, such as YBT-0001'),
	writtenInPack('Build stage number', 'Which build stage the Order Form orders'),
	writtenInPack('Story points of change work a month', 'The change work the Run service includes'),
	writtenInPack('Start date', 'When the work starts'),
	writtenInPack('Ready for acceptance testing date', 'When the stage is ready for acceptance testing'),
	writtenInPack('Run service start date', 'When the Run service starts'),
	writtenInPack('Hosting region', 'The Azure region of the database and front end, with the backup region'),
	writtenInPack('Successor', 'The successor named under Schedule 4, section 5.3, or none')
];

export function findContractBlank(label: string): ContractBlank | undefined {
	return contractBlanks.find((blank) => blank.label === label);
}

const blankPattern = /\[([^[\]]+)\](?!\()/g;
const ticks = new Set([' ', 'x']);

/** Every blank a document still holds, each once, in the order they first appear. */
export function blanksIn(markdown: string): string[] {
	const labels = [...markdown.matchAll(blankPattern)].map((match) => match[1]);
	return [...new Set(labels.filter((label) => !ticks.has(label)))];
}
