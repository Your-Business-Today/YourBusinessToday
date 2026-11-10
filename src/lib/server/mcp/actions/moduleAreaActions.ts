import { booksActions } from './booksActions';
import { brandContentActions } from './brandContentActions';
import { brandContentFlowActions } from './brandContentFlowActions';
import { brandKitActions } from './brandKitActions';
import { businessBrainActions } from './businessBrainActions';
import { businessBrainChatbotActions } from './businessBrainChatbotActions';
import { chatbotReadingActions } from './chatbotReadingActions';
import { chatbotTrailActions } from './businessBrainChatbotTrailActions';
import type { McpAction } from '../actionTypes';

/** The actions of the modules an administrator switches on for an organisation, each in an area of its own. */
export const moduleAreaActions: McpAction[] = [
	...booksActions,
	...brandKitActions,
	...brandContentActions,
	...brandContentFlowActions,
	...businessBrainActions,
	...businessBrainChatbotActions,
	...chatbotReadingActions,
	...chatbotTrailActions
];
