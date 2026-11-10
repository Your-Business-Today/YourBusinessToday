import { booksActions } from './booksActions';
import { brandCampaignActions } from './brandCampaignActions';
import { brandCampaignReportActions } from './brandCampaignReportActions';
import { brandContentActions } from './brandContentActions';
import { brandContentChannelActions } from './brandContentChannelActions';
import { brandContentFlowActions } from './brandContentFlowActions';
import { brandContentPictureActions } from './brandContentPictureActions';
import { brandContentPlanActions } from './brandContentPlanActions';
import { brandKitActions } from './brandKitActions';
import { brandLibraryActions } from './brandLibraryActions';
import { brandPerformanceActions } from './brandPerformanceActions';
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
	...brandContentChannelActions,
	...brandContentFlowActions,
	...brandContentPlanActions,
	...brandContentPictureActions,
	...brandCampaignActions,
	...brandCampaignReportActions,
	...brandPerformanceActions,
	...brandLibraryActions,
	...businessBrainActions,
	...businessBrainChatbotActions,
	...chatbotReadingActions,
	...chatbotTrailActions
];
