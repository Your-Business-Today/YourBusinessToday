import { clientContactActions } from './clientContactActions';
import { companyResearchActions } from './companyResearchActions';
import { personApproachActions } from './personApproachActions';
import { personResearchActions } from './personResearchActions';
import { clientDetailActions } from './clientDetailActions';
import { clientContinuityCopyActions } from './clientContinuityCopyActions';
import { clientProjectActions } from './clientProjectActions';
import { clientRegisterActions } from './clientRegisterActions';
import { clientRemovalActions } from './clientRemovalActions';
import type { McpAction } from '../actionTypes';

export const clientActions: McpAction[] = [
	...clientRegisterActions,
	...clientDetailActions,
	...clientContinuityCopyActions,
	...clientContactActions,
	...companyResearchActions,
	...personResearchActions,
	...personApproachActions,
	...clientProjectActions,
	...clientRemovalActions
];
