import { feedActions } from './feedActions';
import { projectBlueprintActions } from './projectBlueprintActions';
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
	...projectBlueprintActions,
	...feedActions,
	...projectCreateActions,
	...projectWriteActions,
	...projectRemovalActions,
	...projectOrderActions,
	...projectOwnershipActions,
	...teamProjectActions
];
