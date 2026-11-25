import { describe, expect, it } from 'vitest';
import { blankSources, blanksIn, contractBlanks } from './contractBlanks';
import { companyDetails } from './organisationCompanyDetails';
import { contractDetails } from './organisationContractDetails';
import { clientDocumentsFor } from './clientDocumentCatalogue';
import { readClientDocumentBySlug } from '$lib/server/clientDocuments/readClientDocumentBySlug';

const organisationDetailKeys = [...companyDetails.fields, ...contractDetails.fields].map((field) => field.key as string);
const everyContract = clientDocumentsFor('client').map((entry) => readClientDocumentBySlug(entry.slug) ?? '');
const everyBlank = new Set(everyContract.flatMap(blanksIn));
const blanksThatSayNothingOfWhatFillsThem = ['number', 'address', 'Name', 'Position', 'Email', 'date', 'date of MSA', 'amount'];

describe('the blanks in a contract template', () => {
	it('are found in square brackets, each once, leaving out ticks and links', () => {
		const markdown = '- [ ] Discovery\n- [x] Run\n[Client legal name] and [Client legal name], [Start date]. [a link](https://x)';
		expect(blanksIn(markdown)).toEqual(['Client legal name', 'Start date']);
	});

	it('each name what fills them, so a pack can tell one blank from another', () => {
		for (const vague of blanksThatSayNothingOfWhatFillsThem) expect(everyBlank.has(vague)).toBe(false);
	});

	it('are filled from organisation details the organisation really holds', () => {
		const fromOrganisation = contractBlanks.filter((blank) => blank.source === blankSources.organisation);
		for (const blank of fromOrganisation) expect(organisationDetailKeys).toContain(blank.organisationDetail);
	});

	it('are each used by at least one contract', () => {
		for (const blank of contractBlanks) expect(everyBlank.has(blank.label)).toBe(true);
	});
});
