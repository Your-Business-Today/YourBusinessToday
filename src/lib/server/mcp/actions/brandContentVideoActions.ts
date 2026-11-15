import { FilmMakingLimits } from '$lib/brand/film/filmMaking';
import { FilmShapes } from '$lib/brand/film/filmFrame';
import { makeContentPictures, makeContentVideo, recordContentMade } from './brandContentVideoRuns';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';
const pieceIdField = textField('The piece’s id, as draft_content or list_content gives it');
const shapeField = {
	type: 'string',
	enum: Object.keys(FilmShapes),
	description:
		'The frame: wide 1920×1080, square 1080×1080 or tall 1080×1920. Leave it out for the medium’s own (tall for short ' +
		'video and stories, square for posts and carousels, otherwise wide); give the shape of the first clip to match how the piece’s page plays it.'
};

const makeContentSchema = objectSchema(
	{ organisationId: organisationIdField, contentPieceId: pieceIdField, shape: shapeField },
	['organisationId', 'contentPieceId']
);

const recordMadeSchema = objectSchema(
	{
		organisationId: organisationIdField,
		contentPieceId: pieceIdField,
		hasArrived: { type: 'boolean', description: 'True when the recipe ran to the end and sent everything' },
		failureReason: textField(`When hasArrived is false: why it was not made, up to ${FilmMakingLimits.failureReasonCharacters} characters`)
	},
	['organisationId', 'contentPieceId', 'hasArrived']
);

const recipeWords =
	'It answers with a bash recipe for you to run in your own sandbox, as it stands: curl fetches the clips and music by ' +
	'short-lived links, ffmpeg lays the words over them in the brand’s colours and display face, and curl sends what it ' +
	'makes to the brand’s library. Nothing is made on Your Business Today’s side. Then call record_content_made.';

/** The connector actions that have a piece made into its video or its pictures by the caller's own Claude, into the brand's library. */
export const brandContentVideoActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'make_content_video',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'get the recipe to make a video piece into its MP4, from its storyboard, clips and music, into the brand’s library',
		guidance:
			'For “a new video from the ones we have”: read_content of the piece whose shots to reuse; draft_content a new video ' +
			'piece giving each shot its clipItemId, words and seconds, and its musicItemId; watch it on the piece’s page; then ' +
			'call this. Every shot needs a clip, and every clip and the music must be in this brand’s library and allowed to be ' +
			'posted; a piece already being made is refused, by name. ' +
			recipeWords +
			' The video is H.264 and AAC at 30 frames a second, inside the library’s 50 MB, posted on its clips’ footing; it goes on the post with choose_post_picture.',
		inputSchema: makeContentSchema,
		run: makeContentVideo
	}),
	moduleAction(brandModule, {
		name: 'make_content_pictures',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'get the recipe to make a picture piece (a post’s image, a story or a carousel) into one PNG a shot',
		guidance:
			'Each shot of the piece is one picture: give it with draft_content the clipItemId of a photo from list_brand_library and ' +
			'its words (overline, onScreenText as the headline, underline) and wordsAt; a carousel’s pictures are made in the order ' +
			'of its shots. Every shot needs a photo that is in this brand’s library and allowed to be posted; a piece already being ' +
			'made is refused, by name. Each picture fills its frame, cut to it rather than stretched. ' +
			recipeWords +
			' read_content then lists the library items made, in shot order; each goes on the post with choose_post_picture.',
		inputSchema: makeContentSchema,
		run: makeContentPictures
	}),
	moduleAction(brandModule, {
		name: 'record_content_made',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'say the recipe from make_content_video or make_content_pictures has run: everything sent, or why not',
		guidance:
			'Call it once the recipe finishes, with hasArrived true; the site checks every file arrived before it keeps them, and ' +
			'fails the request by name when one did not. When the recipe failed and cannot be put right, call it with hasArrived ' +
			'false and the reason. Only the person who asked can record it.',
		inputSchema: recordMadeSchema,
		run: recordContentMade
	})
];
