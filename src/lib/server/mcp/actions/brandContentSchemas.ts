import { audienceActions } from '$lib/brand/actions/audienceActions';
import { contentStages } from '$lib/brand/content/contentPiece';
import { ContentLimits, StoryboardLimits } from '$lib/brand/content/contentLimits';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { postKindsTraitKey, starterPostKinds } from '$lib/brand/postKinds/postKinds';

const { titleCharacters, hookCharacters, scriptCharacters, captionCharacters } = ContentLimits;
const { shots, descriptionCharacters, onScreenTextCharacters, longestShotSeconds } = StoryboardLimits;

const shotItem = objectSchema(
	{
		description: textField(`What we see and hear, at most ${descriptionCharacters} characters`),
		seconds: { type: 'number', description: `How long the shot holds, from 0 to ${longestShotSeconds} seconds` },
		onScreenText: textField(`Any words shown on screen, at most ${onScreenTextCharacters} characters`)
	},
	['description']
);

/** The kind of post a piece is, offered to drafting and planning alike. */
export const postKindField = textField(
	`The kind of post it is, one the brand keeps as ${postKindsTraitKey} in its kit; while it keeps none, one of the ` +
		`starter list: ${starterPostKinds.join(', ')}. The format is not the kind: a tips carousel is a tip on a carousel medium`
);

export const draftContentSchema = objectSchema(
	{
		organisationId: organisationIdField,
		contentPieceId: textField('An idea’s id, as plan_content_idea or read_content_plan gives it, to write that idea up — leave out for a new piece'),
		medium: textField('The medium the piece is for, such as video.short.tiktok or text.email, as read_brand_catalogue lists'),
		kind: postKindField,
		title: textField(`A working title, at most ${titleCharacters} characters`),
		hook: textField(`The first line or the first second, at most ${hookCharacters} characters`),
		script: textField(`The full script or copy, at most ${scriptCharacters} characters`),
		storyboard: { type: 'array', items: shotItem, description: `The shots, in order, up to ${shots}` },
		caption: textField(`The post's caption, at most ${captionCharacters} characters`),
		invitedAction: {
			type: 'string',
			enum: audienceActions.map((action) => action.key),
			description: 'What the piece asks its audience to do, one the medium allows'
		}
	},
	['organisationId', 'medium', 'title']
);

export const listContentSchema = objectSchema(
	{
		organisationId: organisationIdField,
		stage: { type: 'string', enum: contentStages, description: 'Only the pieces at this stage — leave out for every piece' }
	},
	['organisationId']
);

export const readContentSchema = objectSchema(
	{ organisationId: organisationIdField, contentPieceId: textField('The piece’s id, as draft_content or list_content gives it') },
	['organisationId', 'contentPieceId']
);
