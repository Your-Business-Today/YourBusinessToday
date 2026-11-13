import { organisationDomainRequest } from '$lib/data/personRequests';
import { domainModellingDoctrine, domainPurpose } from './domainModellingDoctrine';
import { domainRunActionName } from './domainRunActionName';

const whereItIsKept =
	"An organisation's domain is kept as pages of the Expertise part of its Your Business Brain, drawn on its Domain tab, found by its search and read by every chatbot on Expertise.";

const showBeforeFiling =
	'Show the person what you will file from each source in the Domain page’s words — the areas, the records, rules, events and words, and anything you supersede — and file only on their yes. Name the source every time, as file_business_brain_page does.';

const runFirst = `To set the whole domain ("${organisationDomainRequest}"), start with ${domainRunActionName} and follow the walk it answers with.`;

export const fileBusinessBrainDomainGuidance = [whereItIsKept, domainPurpose, runFirst, ...domainModellingDoctrine, showBeforeFiling].join('\n');

export const startDomainRunGuidance = [
	'"Set the organisation domain" starts here. It changes nothing: it answers with the walk, which starts from the filed workflow map, reads the connectors in the chat read only, one source at a time, models this one business by the rules of domain-driven design, asks the person for the detail each record, rule and event needs, and files with file_business_brain_domain once they say yes.',
	domainPurpose,
	whereItIsKept
].join('\n');

export const readBusinessBrainDomainGuidance = [
	whereItIsKept,
	'Read it before filing from a new source, so a concept already modelled is written to its own slug, and when someone asks how the business is organised or what a word means in it.'
].join('\n');
