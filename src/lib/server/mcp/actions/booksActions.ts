import { booksReadActions } from './booksReadActions';
import { booksPeriodActions } from './booksPeriodActions';
import { booksPostingActions } from './booksPostingActions';
import type { McpAction } from '../actionTypes';

export const booksActions: McpAction[] = [...booksReadActions, ...booksPeriodActions, ...booksPostingActions];
