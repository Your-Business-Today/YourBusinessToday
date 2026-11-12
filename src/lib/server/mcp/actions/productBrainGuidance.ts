const whatAProductBrainIs =
	"A product's brain is the parts of its organisation's Your Business Brain tied to that product: what the business knows that " +
	'bears on it, open to the people on the product. Your Business Today calls no AI model; you do the reading.';

const whoTiesParts =
	'Only a manager of the organisation, or staff, ties or unties parts, while Your Business Brain is switched on for it. ' +
	'Tie only the parts the people on the product need: expertise, experience, process or people.';

const nothingIsDeleted = 'Untying a part dates its tie rather than deleting it, so what the product could read, and when, stays on record.';

const answerFromItAlone =
	"Answer from the pages you read through the product's brain. Where it holds nothing on the question, say so plainly: " +
	'never guess what the rest of the brain might say, and never fill the gap from general knowledge as if the brain said it.';

export const changeProductBrainGuidance = [whatAProductBrainIs, whoTiesParts, nothingIsDeleted].join('\n');

export const readProductBrainIndexGuidance = [
	whatAProductBrainIs,
	'Start here to see what the product brain holds: every page in its parts by part and title, with its id.',
	answerFromItAlone
].join('\n');

export const searchProductBrainGuidance = [
	'Search the words of every page in the parts tied to the product, best match first. An excerpt is not the page: read a page whole before answering from it.',
	answerFromItAlone
].join('\n');

export const readProductBrainPageGuidance = [
	'Reads one page of the product brain as it now reads, with the related pages it also holds and its history. Give a revisionId to read one earlier version; say so whenever you answer from one.',
	answerFromItAlone
].join('\n');
