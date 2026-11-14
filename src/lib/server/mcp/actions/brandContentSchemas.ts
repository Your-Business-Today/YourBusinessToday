import { audienceActions } from '$lib/brand/actions/audienceActions';
import { contentStages, shotWordPlaces } from '$lib/brand/content/contentPiece';
import { ContentLimits, StoryboardLimits } from '$lib/brand/content/contentLimits';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { postKindsTraitKey, starterPostKinds } from '$lib/brand/postKinds/postKinds';

const { titleCharacters, hookCharacters, scriptCharacters, captionCharacters } = ContentLimits;
const { shots, descriptionCharacters, onScreenTextCharacters, overlineCharacters, underlineCharacters, longestShotSeconds } =
	StoryboardLimits;
const libraryItemNote = 'a library item’s id, as list_brand_library gives it';

const shotItem = objectSchema(
	{
		description: textField(`What we see and hear, at most ${descriptionCharacters} characters`),
		seconds: { type: 'number', description: `How long the shot holds, from 0 to ${longestShotSeconds} seconds` },
		onScreenText: textField(`The headline shown on screen, at most ${onScreenTextCharacters} characters`),
		overline: textField(`A small line above the headline, at most ${overlineCharacters} characters`),
		underline: textField(`A line beneath the headline, at most ${underlineCharacters} characters`),
		wordsAt: { type: 'string', enum: shotWordPlaces, description: 'Where the words sit on the frame — bottom when left out' },
		clipItemId: textField(`The photo or video the shot shows: ${libraryItemNote}`)
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
		contentPieceId: textField(
			'An idea’s or a drafted piece’s id, as read_content_plan or list_content gives it, to draft it again — leave out for a new piece'
		),
		medium: textField(
			'The medium the piece is for, such as video.short.tiktok or text.email, as read_brand_catalogue lists — needed for a new piece'
		),
		kind: postKindField,
		title: textField(`A working title, at most ${titleCharacters} characters — needed for a new piece`),
		hook: textField(`The first line or the first second, at most ${hookCharacters} characters`),
		script: textField(`The full script or copy, at most ${scriptCharacters} characters`),
		storyboard: { type: 'array', items: shotItem, description: `The shots, in order, up to ${shots}` },
		caption: textField(`The post's caption, at most ${captionCharacters} characters`),
		musicItemId: textField(`A video’s music: ${libraryItemNote}, or empty to take it off`),
		invitedAction: {
			type: 'string',
			enum: audienceActions.map((action) => action.key),
			description: 'What the piece asks its audience to do, one the medium allows'
		}
	},
	['organisationId']
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
