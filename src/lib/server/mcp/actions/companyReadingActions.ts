import { accountsReadingActions } from './accountsReadingActions';
import { cashScreenActions } from './cashScreenActions';
import { companyConnectionActions } from './companyConnectionActions';
import type { McpAction } from '../actionTypes';

/** What staff read about any company before an approach: its cash from the accounts, who is behind it, and a whole territory screened for cash. */
export const companyReadingActions: McpAction[] = [...accountsReadingActions, ...companyConnectionActions, ...cashScreenActions];
