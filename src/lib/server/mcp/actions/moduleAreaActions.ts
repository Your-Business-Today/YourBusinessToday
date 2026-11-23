import { booksActions } from './booksActions';
import { brandCampaignActions } from './brandCampaignActions';
import { brandCampaignReportActions } from './brandCampaignReportActions';
import { brandContentActions } from './brandContentActions';
import { brandContentChannelActions } from './brandContentChannelActions';
import { brandContentFlowActions } from './brandContentFlowActions';
import { brandContentPictureActions } from './brandContentPictureActions';
import { brandContentPlanActions } from './brandContentPlanActions';
import { brandContentVideoActions } from './brandContentVideoActions';
import { brandKitActions } from './brandKitActions';
import { brandLibraryActions } from './brandLibraryActions';
import { brandPerformanceActions } from './brandPerformanceActions';
import { businessBrainActions } from './businessBrainActions';
import { businessBrainDomainActions } from './businessBrainDomainActions';
import { businessBrainChatbotActions } from './businessBrainChatbotActions';
import { chatReadingActions } from './chatReadingActions';
import { chatWritingActions } from './chatWritingActions';
import { chatbotReadingActions } from './chatbotReadingActions';
import { chatbotTrailActions } from './businessBrainChatbotTrailActions';
import { myBrainsActions } from './myBrainsActions';
import { newsWatchListActions } from './newsWatchListActions';
import { newsStoryActions } from './newsStoryActions';
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
	...brandContentVideoActions,
	...brandCampaignActions,
	...brandCampaignReportActions,
	...brandPerformanceActions,
	...brandLibraryActions,
	...businessBrainActions,
	...businessBrainDomainActions,
	...businessBrainChatbotActions,
	...chatReadingActions,
	...chatWritingActions,
	...chatbotReadingActions,
	...chatbotTrailActions,
	...myBrainsActions,
	...newsWatchListActions,
	...newsStoryActions
];
