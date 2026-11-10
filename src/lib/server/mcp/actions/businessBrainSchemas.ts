import { businessBrainLimits, businessBrainPartKinds, businessBrainReadLimits } from '$lib/data/businessBrainRules';
import { businessBrainFileLimits } from '$lib/data/businessBrainFileRules';
import { objectSchema, proseField, textField } from '../actionTypes';

const { longestTitle, longestSummary, longestSlug, longestKind, longestSourceTitle, longestOrigin, longestSourceSummary } =
	businessBrainLimits;

export const organisationField = textField('The organisation whose brain it is, as list_organisations gives it');

/** The source a page came from, named new or by an earlier filing's id. */
export const sourceNamingFields = {
	sourceTitle: textField(`What you read it in, such as "Email from Nigel, 3 Nov 2026" — at most ${longestSourceTitle} characters; leave out when giving sourceId`),
	sourceOrigin: textField(
		'Where the source can be found, so a reader can open it again: a web address such as the SharePoint or OneDrive file link, ' +
			`the mailbox and subject of a mail thread, the Teams team and channel, or a file name — at most ${longestOrigin} characters`
	),
	sourceSummary: textField(`What the source is, in a sentence — at most ${longestSourceSummary} characters`),
	sourceId: textField('A source filed before, as an earlier filing gave it back; leave out when naming a new source')
};

const sourceFields = {
	...sourceNamingFields,
	sourceFileIds: {
		type: 'array',
		items: { type: 'string' },
		description: `The files the page was written from, each fileId as record_business_brain_file_upload gave it back — at most ${businessBrainFileLimits.mostFilesPerPage}`
	}
};

const pageWordFields = {
	title: textField(`The page's one subject, at most ${longestTitle} characters`),
	summary: textField(`The page in a sentence or two, at most ${longestSummary} characters`),
	body: proseField('The text of the page: what the source says about its one subject')
};

const kindDescription = `What the page is, in lower-case words joined by underscores, such as person, client, rule, process or fact — at most ${longestKind} characters`;

/** A new page as it is filed, without the organisation it is filed into. */
export const newPageFields = {
	part: { type: 'string', enum: [...businessBrainPartKinds], description: 'The part of the business the page belongs to' },
	kind: textField(kindDescription),
	...pageWordFields,
	slug: textField(`The page's short name in its part, lower-case words joined by hyphens, at most ${longestSlug} characters; made from the title when left out`),
	...sourceFields
};

export const newPageRequiredFields = ['part', 'kind', 'title', 'body'];

export const fileBusinessBrainPageSchema = objectSchema(
	{ organisationId: organisationField, ...newPageFields },
	['organisationId', ...newPageRequiredFields]
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

/** The fields a reading of Your Business Brain takes, the same whether the brain is read whole or through a chatbot. */
export const partToListField = {
	type: 'string',
	enum: [...businessBrainPartKinds],
	description: 'One part of the business to list; leave out for all of it'
};

export const searchField = textField(
	`The words to look for, at most ${longestSearch} characters: "a phrase in quotes" must appear as it is, -word leaves pages with it out, OR finds either`
);

export const pageToReadField = textField('The page, as the index, a search or filing gave it');

export const revisionToReadField = textField('One earlier version of the page, as its history lists it; leave out for the page as it now reads');

export const readBusinessBrainIndexSchema = objectSchema({ organisationId: organisationField, part: partToListField }, ['organisationId']);

export const searchBusinessBrainSchema = objectSchema({ organisationId: organisationField, search: searchField }, ['organisationId', 'search']);

export const readBusinessBrainPageSchema = objectSchema(
	{ organisationId: organisationField, pageId: pageToReadField, revisionId: revisionToReadField },
	['organisationId', 'pageId']
);
