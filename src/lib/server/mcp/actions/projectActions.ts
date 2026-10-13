import { databaseTaskActions } from './databaseTaskActions';
import { feedActions } from './feedActions';
import { projectCreateActions } from './projectCreateActions';
import { projectOrderActions } from './projectOrderActions';
import { projectOwnershipActions } from './projectOwnershipActions';
import { projectReadActions } from './projectReadActions';
import { projectRemovalActions } from './projectRemovalActions';
import { projectWriteActions } from './projectWriteActions';
import { teamProjectActions } from './teamProjectActions';
import type { McpAction } from '../actionTypes';

export const projectActions: McpAction[] = [
	...projectReadActions,
	...feedActions,
	...databaseTaskActions,
	...projectCreateActions,
	...projectWriteActions,
	...projectRemovalActions,
	...projectOrderActions,
	...projectOwnershipActions,
	...teamProjectActions
];
