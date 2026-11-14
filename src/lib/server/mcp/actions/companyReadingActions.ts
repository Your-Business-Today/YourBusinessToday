import { accountsReadingActions } from './accountsReadingActions';
import { companyConnectionActions } from './companyConnectionActions';
import type { McpAction } from '../actionTypes';

/** What staff read about any company before an approach: its cash from the accounts, and who is behind it. */
export const companyReadingActions: McpAction[] = [...accountsReadingActions, ...companyConnectionActions];
