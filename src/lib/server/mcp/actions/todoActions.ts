import { todoDeleteActions } from './todoDeleteActions';
import { todoReadActions } from './todoReadActions';
import { todoWriteActions } from './todoWriteActions';
import type { McpAction } from '../actionTypes';

export const todoActions: McpAction[] = [...todoReadActions, ...todoWriteActions, ...todoDeleteActions];
