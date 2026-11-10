import { ContentLimits } from '$lib/brand/content/contentLimits';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { reviewVerdicts } from '$lib/brand/content/contentReview';

const { publishedUrlCharacters, reviewCharacters } = ContentLimits;

const contentPieceIdField = textField('The piece’s id, as draft_content or list_content gives it');
const pieceFields = {
	organisationId: organisationIdField,
	contentPieceId: contentPieceIdField
};
const pieceRequired = ['organisationId', 'contentPieceId'];

export const sendContentForApprovalSchema = objectSchema(pieceFields, pieceRequired);

export const reviewContentSchema = objectSchema(
	{
		...pieceFields,
		verdict: {
			type: 'string',
			enum: reviewVerdicts,
			description: 'approved, changes_requested to send it back to drafted, or comment to leave it where it is'
		},
		body: textField(
			`What you think, or what should change, at most ${reviewCharacters} characters — needed unless approving`
		)
	},
	[...pieceRequired, 'verdict']
);

export const scheduleContentSchema = objectSchema(
	{
		...pieceFields,
		scheduledFor: textField('When it goes out, as an ISO date and time with its zone, such as 2026-12-01T09:00:00Z')
	},
	[...pieceRequired, 'scheduledFor']
);

export const recordPublicationSchema = objectSchema(
	{
		...pieceFields,
		publishedUrl: textField(
			`The public link to the piece where it went out, at most ${publishedUrlCharacters} characters`
		)
	},
	[...pieceRequired, 'publishedUrl']
);
