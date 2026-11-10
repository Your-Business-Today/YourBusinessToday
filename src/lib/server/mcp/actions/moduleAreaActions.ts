import { booksActions } from './booksActions';
import { brandKitReadActions } from './brandKitReadActions';
import { businessBrainActions } from './businessBrainActions';
import type { McpAction } from '../actionTypes';

/** The actions of the modules an administrator switches on for an organisation, each in an area of its own. */
export const moduleAreaActions: McpAction[] = [...booksActions, ...brandKitReadActions, ...businessBrainActions];
