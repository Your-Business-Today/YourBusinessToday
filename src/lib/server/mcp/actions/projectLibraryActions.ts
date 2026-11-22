import { projectDocumentActions } from './projectDocumentActions';
import { projectVideoActions } from './projectVideoActions';
import { searchProjectLibraryAction } from './projectLibrarySearchAction';
import type { McpAction } from '../actionTypes';

/** The connector actions on what a project keeps for its people to learn from: its videos, its documents, and the search over both. */
export const projectLibraryActions: McpAction[] = [...projectVideoActions, ...projectDocumentActions, searchProjectLibraryAction];
