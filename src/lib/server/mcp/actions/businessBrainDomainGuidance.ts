import { organisationDomainRequest, productDomainRequest } from '$lib/data/personRequests';
import { domainModellingDoctrine } from './domainModellingDoctrine';
import { domainRunActionName, productDomainRunActionName } from './domainRunActionName';

const whereItIsKept =
	"An organisation's domain is kept as pages of the Expertise part of its Your Business Brain, drawn on its Domain tab, found by its search and read by every chatbot on Expertise.";

const showBeforeFiling =
	'Show the person what you will file from each source — the contexts, the pages and anything you supersede — and file only on their yes. Name the source every time, as file_business_brain_page does.';

const runFirst = `To set the whole domain ("${organisationDomainRequest}"), start with ${domainRunActionName} and follow the walk it answers with.`;

export const fileBusinessBrainDomainGuidance = [whereItIsKept, runFirst, ...domainModellingDoctrine, showBeforeFiling].join('\n');

export const startDomainRunGuidance = [
	'"Set the organisation domain" starts here. It changes nothing: it answers with the walk, which reads the connectors in the chat read only, one source at a time, models each by the rules of domain-driven design, and files with file_business_brain_domain once the person says yes.',
	whereItIsKept
].join('\n');

export const readBusinessBrainDomainGuidance = [
	whereItIsKept,
	'Read it before filing from a new source, so a concept already modelled is written to its own slug, and when someone asks how the business is organised or what a word means in it.'
].join('\n');

const whereAProductsIsKept =
	"A product's own domain is kept as pages of the Expertise part of its organisation's Your Business Brain that carry the product, apart from the organisation's own domain and every other product's: a slug names one page of each. It is drawn on the product's Domain tab in place of what its repository gives, and listed first in its product brain.";

const productRunFirst = `To set the whole product domain ("${productDomainRequest}"), start with ${productDomainRunActionName} and follow the walk it answers with.`;

export const fileProductBrainDomainGuidance = [whereAProductsIsKept, productRunFirst, ...domainModellingDoctrine, showBeforeFiling].join('\n');

export const startProductDomainRunGuidance = [
	'"Set the product domain" starts here. It changes nothing: it answers with the walk, which reads the repository, the designs, the documents and the stories read only, one source at a time, models each by the rules of domain-driven design, and files with file_product_brain_domain once the person says yes.',
	whereAProductsIsKept
].join('\n');

export const readProductBrainDomainGuidance = [
	whereAProductsIsKept,
	"Read it before filing from a new source, so a concept already modelled is written to its own slug; read_business_brain_domain gives the organisation's words, which a product's domain borrows rather than repeats."
].join('\n');
