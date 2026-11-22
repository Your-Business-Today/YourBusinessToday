import { projectDocumentActions } from './projectDocumentActions';
import { projectVideoActions } from './projectVideoActions';
import type { McpAction } from '../actionTypes';

/** The connector actions on what a project keeps for its people to learn from: its videos and its documents. */
export const projectLibraryActions: McpAction[] = [...projectVideoActions, ...projectDocumentActions];
