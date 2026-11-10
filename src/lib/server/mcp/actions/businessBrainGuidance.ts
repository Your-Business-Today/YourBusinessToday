import { businessBrainPartKinds } from '$lib/data/businessBrainRules';

const whatTheBrainIs =
	"Your Business Brain is the organisation's own private memory. You do the reading and the thinking; " +
	'Your Business Today keeps what you file and calls no AI model.';

const howToFile = [
	'File one subject to a page: one person, client, supplier, rule, process or fact. Split a document that covers several subjects into several pages.',
	`Put each page in the part of the business it belongs to: ${businessBrainPartKinds.join(', ')}.`,
	'Name the source every time: what you read it in (an email, a document, a meeting, a web page) and where it can be found. File every page you take from one source with the sourceId the first filing gave back.',
	'File what the source says and nothing it does not. Where you are unsure what it means, which part it belongs to or whether it is still true, ask the person you are working with before filing, and file their answer with them named as the source.',
	'Where you read a file — a document, a photo, an export — keep it with the brain through grant_business_brain_file_upload and record_business_brain_file_upload, and name it in sourceFileIds on every page written from it.',
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

const howToAnswerFromTheBrain = [
	'Answer from the pages you read, and from nothing else when the question is about this business: its people, clients, suppliers, rules, prices and ways of working.',
	'Cite every page you answer from by its title and page id, and name its source when it has one.',
	'Where the brain is silent on the question, or only an excerpt touched on it, say so plainly; never fill the gap from general knowledge as if the brain said it. Offer to file the answer once the person gives it.',
	'Where two pages disagree, say so and name both; where a page may be out of date, give the date it was last filed.'
];

const howToJudgeAPhotoAgainstTheBrain = [
	'When the person gives you a photo to check against the brain, you look at it and Your Business Today never sees it: describe in words everything in it that a rule could bear on before you search, and send only those words. Never upload or file a photo you are judging.',
	'Judge one observation at a time: search for it in the words the business would use (ladders, end of the day, put away), and read whole every page that bears on it before judging.',
	'Give each observation one of three findings: in order, with the rule it meets; not in order, with the rule it breaks; or cannot be judged, because the photo does not show enough to tell. Name the title and page id of the page behind every finding.',
	'Judge only against rules the brain holds. Where the brain is silent on what the photo shows, say the brain is silent on it and give no verdict, not even what is usual elsewhere; offer to file the rule once the person states it.'
];

export const readBusinessBrainIndexGuidance = [
	whatTheBrainIs,
	'Start here to see what the brain holds: every page by part and title, with its id. Read the pages you need with read_business_brain_page.',
	...howToAnswerFromTheBrain
].join('\n');

export const searchBusinessBrainGuidance = [
	whatTheBrainIs,
	'Search the words of every page, best match first, with a few words of each around the match. An excerpt is not the page: read a page whole before answering from it.',
	'No match means the brain holds nothing on those words: try the words the business would use, then say the brain is silent.',
	...howToAnswerFromTheBrain,
	...howToJudgeAPhotoAgainstTheBrain
].join('\n');

export const readBusinessBrainPageGuidance = [
	whatTheBrainIs,
	"Reads one page as it now reads: its words, facts, source, the pages it relates to and its history. Give a revisionId to read one earlier version; say so whenever you answer from one.",
	...howToAnswerFromTheBrain,
	...howToJudgeAPhotoAgainstTheBrain
].join('\n');
