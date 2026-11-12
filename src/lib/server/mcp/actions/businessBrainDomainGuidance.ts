import { domainModellingDoctrine } from './domainModellingDoctrine';
import { domainRunActionName } from './domainRunActionName';

const whereItIsKept =
	"An organisation's domain is kept as pages of the Expertise part of its Your Business Brain, drawn on its Domain tab, found by its search and read by every chatbot on Expertise.";

const showBeforeFiling =
	'Show the person what you will file from each source — the contexts, the pages and anything you supersede — and file only on their yes. Name the source every time, as file_business_brain_page does.';

const runFirst = `To set the whole domain ("set the organisation domain"), start with ${domainRunActionName} and follow the walk it answers with.`;

export const fileBusinessBrainDomainGuidance = [whereItIsKept, runFirst, ...domainModellingDoctrine, showBeforeFiling].join('\n');

export const startDomainRunGuidance = [
	'"Set the organisation domain" starts here. It changes nothing: it answers with the walk, which reads the connectors in the chat read only, one source at a time, models each by the rules of domain-driven design, and files with file_business_brain_domain once the person says yes.',
	whereItIsKept
].join('\n');

export const readBusinessBrainDomainGuidance = [
	whereItIsKept,
	'Read it before filing from a new source, so a concept already modelled is written to its own slug, and when someone asks how the business is organised or what a word means in it.'
].join('\n');
