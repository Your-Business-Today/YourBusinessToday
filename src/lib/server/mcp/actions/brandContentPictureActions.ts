import { choosePostPicture, listPostsAwaitingPicture, sayPostPictureNeeded } from './brandContentPictureRuns';
import { choosePostPictureSchema, listPostsAwaitingPictureSchema, sayPostPictureNeededSchema } from './brandContentPictureSchemas';
import { moduleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

/** Every connector action on the picture of a post: saying what it needs, choosing one from the library, and listing the posts waiting. */
export const brandContentPictureActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'say_post_picture_needed',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'say in words what photo or video a post needs and where it is expected to come from',
		guidance:
			'Said once for the post and shown on every channel it goes out on; saying it again replaces the words. Once it is ' +
			'said, the month’s plan marks the post as waiting on a picture until one is chosen. A value that does not fit its ' +
			'column is refused by name, never trimmed.',
		inputSchema: sayPostPictureNeededSchema,
		run: sayPostPictureNeeded
	}),
	moduleAction(brandModule, {
		name: 'choose_post_picture',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'choose a photo or video from the brand’s library for a post, shown beside its caption on every channel',
		guidance:
			'Read the library with list_brand_library and look at the item before choosing it. An item marked ' +
			'not to be posted, or whose file has not arrived, is refused by name. A post may carry more than one, such as for ' +
			'a carousel; nothing takes one off.',
		inputSchema: choosePostPictureSchema,
		run: choosePostPicture
	}),
	moduleAction(brandModule, {
		name: 'list_posts_awaiting_picture',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'the posts of a month that need a picture and have none, or whose picture may no longer be posted',
		guidance: 'Each post is listed once, with what it needs and the id of its first channel, ready for choose_post_picture.',
		inputSchema: listPostsAwaitingPictureSchema,
		run: listPostsAwaitingPicture
	})
];
