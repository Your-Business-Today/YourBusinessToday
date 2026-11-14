import { makeContentVideo } from './brandContentVideoRuns';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

const makeContentVideoSchema = objectSchema(
	{ organisationId: organisationIdField, contentPieceId: textField('The video piece’s id, as draft_content or list_content gives it') },
	['organisationId', 'contentPieceId']
);

/** The connector action that has a video piece made into its MP4, in the brand's library. */
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
		inputSchema: makeContentVideoSchema,
		run: makeContentVideo
	})
];
