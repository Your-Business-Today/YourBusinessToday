import { areaMapActions } from './areaMapActions';
import { clientContactActions } from './clientContactActions';
import { clientDocumentActions } from './clientDocumentActions';
import { companyResearchActions } from './companyResearchActions';
import { peopleRegisterActions } from './peopleRegisterActions';
import { personApproachActions } from './personApproachActions';
import { personLinkActions } from './personLinkActions';
import { personResearchActions } from './personResearchActions';
import { personUpdateActions } from './personUpdateActions';
import { clientDetailActions } from './clientDetailActions';
import { clientGroupActions } from './clientGroupActions';
import { clientProfileActions } from './clientProfileActions';
import { companySearchActions } from './companySearchActions';
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
	...clientProfileActions,
	...clientGroupActions,
	...companySearchActions,
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
	...clientRemovalActions,
	...clientDocumentActions,
	...areaMapActions
];
