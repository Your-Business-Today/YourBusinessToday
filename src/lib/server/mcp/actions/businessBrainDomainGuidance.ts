import { domainCheckRequest, organisationDomainRequest } from '$lib/data/personRequests';
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
	'Read it before filing from a new source, so a concept already modelled is written to its own slug, and when someone asks how the business is organised or what a word means in it.',
	"It ends with the things no task of today's workflow map takes in or produces: each is a task the map is missing, or a phrase on the map that should be its word."
].join('\n');

export const startDomainCheckGuidance = [
	`"${domainCheckRequest}" starts here. It changes nothing: it answers with the candidates the site finds in the domain and the walk to judge them, reading each suspect page whole before judging it, and filing each repair with file_business_brain_domain only on the person’s yes, folding a page into another with retires so that its knowledge lands in the page written in the same call.`,
	'A candidate is a suspicion, not a fault, and a healthy domain is a valid outcome.',
	whereItIsKept
].join('\n');
