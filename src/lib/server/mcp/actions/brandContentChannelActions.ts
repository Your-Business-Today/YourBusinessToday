import { addContentChannel } from './brandContentChannelRuns';
import { addContentChannelSchema } from './brandContentChannelSchemas';
import { moduleAction } from '../organisationModuleGate';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';

/** Every connector action on the channels a post of the brand's content goes out on. */
export const brandContentChannelActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'add_content_channel',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'send a post of the brand’s content out on one more channel, with its own caption fitted to that channel',
		guidance:
			'Call resolve_brand for the new channel first and write its caption to the brand as it holds there. The new ' +
			'channel shares the post’s title, hook, script, storyboard, kind and planned day, keeps a snapshot of the brand at ' +
			'that channel, and starts at drafted, or at idea while the post is still an idea. How many hashtags a channel ' +
			'takes and where its link goes are the kit’s decisions at that channel; a caption that does not keep to them is ' +
			'refused by name, never trimmed. read_content shows the post with every channel.',
		inputSchema: addContentChannelSchema,
		run: addContentChannel
	})
];
