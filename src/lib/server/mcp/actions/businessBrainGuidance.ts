import { businessBrainPartKinds } from '$lib/data/businessBrainRules';

const whatTheBrainIs =
	"Your Business Brain is the organisation's own private memory. You do the reading and the thinking; " +
	'Your Business Today keeps what you file and calls no AI model.';

const howToFile = [
	'File one subject to a page: one person, client, supplier, rule, process or fact. Split a document that covers several subjects into several pages.',
	`Put each page in the part of the business it belongs to: ${businessBrainPartKinds.join(', ')}.`,
	'Name the source every time: what you read it in (an email, a document, a meeting, a web page) and where it can be found. File every page you take from one source with the sourceId the first filing gave back.',
	'File what the source says and nothing it does not. Where you are unsure what it means, which part it belongs to or whether it is still true, ask the person you are working with before filing, and file their answer with them named as the source.',
	'A subject already filed takes a revision, never a second page: the earlier version goes into the page’s history, and nothing is overwritten or deleted.',
	'Never file a password, a key, or personal details the business has no need to keep.'
];

export const fileBusinessBrainPageGuidance = [
	whatTheBrainIs,
	...howToFile,
	'When a page on the same subject is already in the part, filing answers with its id: file what is new about it with file_business_brain_page_revision.'
].join('\n');

export const fileBusinessBrainRevisionGuidance = [
	whatTheBrainIs,
	...howToFile,
	'Give the whole page as it should now read, not only what changed. A kind or summary left out is kept as the page has it.'
].join('\n');
