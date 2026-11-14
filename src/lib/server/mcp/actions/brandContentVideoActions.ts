import { makeContentPictures, makeContentVideo } from './brandContentVideoRuns';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

const makeContentSchema = objectSchema(
	{ organisationId: organisationIdField, contentPieceId: textField('The piece’s id, as draft_content or list_content gives it') },
	['organisationId', 'contentPieceId']
);

/** The connector actions that have a piece made into its video or its pictures, in the brand's library. */
export const brandContentVideoActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'make_content_video',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'have a video piece made into its MP4 from its storyboard, its clips and its music, ready in the brand’s library',
		guidance:
			'For “a new video from the ones we have”: read_content of the piece whose shots to reuse; draft_content a new video ' +
			'piece giving each shot its clipItemId, words and seconds, and its musicItemId; watch it on the piece’s page; then ' +
			'call this. Every shot needs a clip, and every clip and the music must be in this brand’s library and allowed to be ' +
			'posted; a piece already being made is refused, by name. The film is made by code on GitHub’s runner, the same way ' +
			'every time: the footage and music laid in, the words drawn over them, H.264 and AAC at 30 frames a second, inside ' +
			'the library’s 50 MB. read_content says where it stands. When it is ready it is a video in the library, posted on ' +
			'its clips’ footing, and goes on the post with choose_post_picture.',
		inputSchema: makeContentSchema,
		run: makeContentVideo
	}),
	moduleAction(brandModule, {
		name: 'make_content_pictures',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'have a picture piece (a post’s image, a story or a carousel) made into one PNG a shot from its photos and words',
		guidance:
			'Each shot of the piece is one picture: give it with draft_content the clipItemId of a photo from list_brand_library and ' +
			'its words (overline, onScreenText as the headline, underline) and wordsAt; a carousel’s pictures are made in the order ' +
			'of its shots. Every shot needs a photo that is in this brand’s library and allowed to be posted; a piece already being ' +
			'made is refused, by name. Each picture fills the frame its photo’s shape takes (1920×1080, 1080×1080 or 1080×1920), ' +
			'cut to it rather than stretched, with its words drawn over it, made by code on GitHub’s runner. read_content says ' +
			'where they stand and lists the library items made, in shot order; each goes on the post with choose_post_picture.',
		inputSchema: makeContentSchema,
		run: makeContentPictures
	})
];
