import { domainModellingDoctrine } from './domainModellingDoctrine';

const whereItIsKept =
	"An organisation's domain is kept as pages of the Expertise part of its Your Business Brain, drawn on its Domain tab, found by its search and read by every chatbot on Expertise.";

const showBeforeFiling =
	'Show the person what you will file from each source — the contexts, the pages and anything you supersede — and file only on their yes. Name the source every time, as file_business_brain_page does.';

export const fileBusinessBrainDomainGuidance = [whereItIsKept, ...domainModellingDoctrine, showBeforeFiling].join('\n');

export const readBusinessBrainDomainGuidance = [
	whereItIsKept,
	'Read it before filing from a new source, so a concept already modelled is written to its own slug, and when someone asks how the business is organised or what a word means in it.'
].join('\n');
