import { clientContactActions } from './clientContactActions';
import { companyResearchActions } from './companyResearchActions';
import { clientDetailActions } from './clientDetailActions';
import { clientContinuityCopyActions } from './clientContinuityCopyActions';
import { clientProjectActions } from './clientProjectActions';
import { clientRegisterActions } from './clientRegisterActions';
import type { McpAction } from '../actionTypes';

export const clientActions: McpAction[] = [
	...clientRegisterActions,
	...clientDetailActions,
	...clientContinuityCopyActions,
	...clientContactActions,
	...companyResearchActions,
	...clientProjectActions
];
