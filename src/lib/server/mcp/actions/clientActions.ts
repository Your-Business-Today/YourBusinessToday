import { clientContactActions } from './clientContactActions';
import { companyResearchActions } from './companyResearchActions';
import { peopleRegisterActions } from './peopleRegisterActions';
import { personApproachActions } from './personApproachActions';
import { personLinkActions } from './personLinkActions';
import { personResearchActions } from './personResearchActions';
import { personUpdateActions } from './personUpdateActions';
import { clientDetailActions } from './clientDetailActions';
import { clientContinuityCopyActions } from './clientContinuityCopyActions';
import { clientProjectActions } from './clientProjectActions';
import { clientRegisterActions } from './clientRegisterActions';
import { clientSetUpActions } from './clientSetUpActions';
import { clientRemovalActions } from './clientRemovalActions';
import { leadConversationActions } from './leadConversationActions';
import { officerActions } from './officerActions';
import { officerAppointmentActions } from './officerAppointmentActions';
import { salesLeaderboardActions } from './salesLeaderboardActions';
import type { McpAction } from '../actionTypes';

export const clientActions: McpAction[] = [
	...clientRegisterActions,
	...clientDetailActions,
	...clientContinuityCopyActions,
	...clientContactActions,
	...leadConversationActions,
	...salesLeaderboardActions,
	...companyResearchActions,
	...clientSetUpActions,
	...peopleRegisterActions,
	...personUpdateActions,
	...personLinkActions,
	...officerActions,
	...officerAppointmentActions,
	...personResearchActions,
	...personApproachActions,
	...clientProjectActions,
	...clientRemovalActions
];
