import { businessBrainLimits, businessBrainPartKinds, businessBrainReadLimits } from '$lib/data/businessBrainRules';
import { objectSchema, proseField, textField } from '../actionTypes';

const { longestTitle, longestSummary, longestSlug, longestKind, longestSourceTitle, longestOrigin, longestSourceSummary } =
	businessBrainLimits;

const organisationField = textField('The organisation whose brain it is, as list_organisations gives it');

const sourceFields = {
	sourceTitle: textField(`What you read it in, such as "Email from Nigel, 3 Nov 2026" — at most ${longestSourceTitle} characters; leave out when giving sourceId`),
	sourceOrigin: textField(`Where the source can be found: a web address, a file name or a mailbox — at most ${longestOrigin} characters`),
	sourceSummary: textField(`What the source is, in a sentence — at most ${longestSourceSummary} characters`),
	sourceId: textField('A source filed before, as an earlier filing gave it back; leave out when naming a new source')
};

const pageWordFields = {
	title: textField(`The page's one subject, at most ${longestTitle} characters`),
	summary: textField(`The page in a sentence or two, at most ${longestSummary} characters`),
	body: proseField('The text of the page: what the source says about its one subject')
};

const kindDescription = `What the page is, in lower-case words joined by underscores, such as person, client, rule, process or fact — at most ${longestKind} characters`;

export const fileBusinessBrainPageSchema = objectSchema(
	{
		organisationId: organisationField,
		part: { type: 'string', enum: [...businessBrainPartKinds], description: 'The part of the business the page belongs to' },
		kind: textField(kindDescription),
		...pageWordFields,
		slug: textField(`The page's short name in its part, lower-case words joined by hyphens, at most ${longestSlug} characters; made from the title when left out`),
		...sourceFields
	},
	['organisationId', 'part', 'kind', 'title', 'body']
);

export const fileBusinessBrainRevisionSchema = objectSchema(
	{
		organisationId: organisationField,
		pageId: textField('The page being revised, as filing it gave it back'),
		kind: textField(`${kindDescription}; kept as it is when left out`),
		...pageWordFields,
		...sourceFields
	},
	['organisationId', 'pageId', 'title', 'body']
);

const { longestSearch } = businessBrainReadLimits;

export const readBusinessBrainIndexSchema = objectSchema(
	{
		organisationId: organisationField,
		part: { type: 'string', enum: [...businessBrainPartKinds], description: 'One part of the business to list; leave out for the whole brain' }
	},
	['organisationId']
);

export const searchBusinessBrainSchema = objectSchema(
	{
		organisationId: organisationField,
		search: textField(
			`The words to look for, at most ${longestSearch} characters: "a phrase in quotes" must appear as it is, -word leaves pages with it out, OR finds either`
		)
	},
	['organisationId', 'search']
);

export const readBusinessBrainPageSchema = objectSchema(
	{
		organisationId: organisationField,
		pageId: textField('The page, as the index, a search or filing gave it'),
		revisionId: textField("One earlier version of the page, as its history lists it; leave out for the page as it now reads")
	},
	['organisationId', 'pageId']
);
