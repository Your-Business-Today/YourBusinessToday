import { booksReadActions } from './booksReadActions';
import { booksPeriodActions } from './booksPeriodActions';
import { booksPostingActions } from './booksPostingActions';
import { booksSettingsActions } from './booksSettingsActions';
import { booksLedgerAccountActions } from './booksLedgerAccountActions';
import { booksCostCentreActions } from './booksCostCentreActions';
import { booksCustomerActions } from './booksCustomerActions';
import { booksInvoiceActions } from './booksInvoiceActions';
import { booksInvoiceReadActions } from './booksInvoiceReadActions';
import { booksInvoicePostingActions } from './booksInvoicePostingActions';
import type { McpAction } from '../actionTypes';

export const booksActions: McpAction[] = [
	...booksReadActions,
	...booksPeriodActions,
	...booksPostingActions,
	...booksSettingsActions,
	...booksLedgerAccountActions,
	...booksCostCentreActions,
	...booksCustomerActions,
	...booksInvoiceActions,
	...booksInvoiceReadActions,
	...booksInvoicePostingActions
];
