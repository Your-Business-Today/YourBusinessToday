import { feedActions } from './feedActions';
import { projectOrderActions } from './projectOrderActions';
import { projectOwnershipActions } from './projectOwnershipActions';
import { projectReadActions } from './projectReadActions';
import { projectRemovalActions } from './projectRemovalActions';
import { projectWriteActions } from './projectWriteActions';
import type { McpAction } from '../actionTypes';

export const projectActions: McpAction[] = [
	...projectReadActions,
	...feedActions,
	...projectWriteActions,
	...projectRemovalActions,
	...projectOrderActions,
	...projectOwnershipActions
];
