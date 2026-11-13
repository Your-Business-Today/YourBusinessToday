import { booksReadActions } from './booksReadActions';
import { booksPeriodActions } from './booksPeriodActions';
import { booksPostingActions } from './booksPostingActions';
import { booksSettingsActions } from './booksSettingsActions';
import { booksLedgerAccountActions } from './booksLedgerAccountActions';
import { booksLoanAccountActions } from './booksLoanAccountActions';
import { booksCostCentreActions } from './booksCostCentreActions';
import { booksCustomerActions } from './booksCustomerActions';
import { booksInvoiceActions } from './booksInvoiceActions';
import { booksInvoiceReadActions } from './booksInvoiceReadActions';
import { booksInvoicePostingActions } from './booksInvoicePostingActions';
<<<<<<< HEAD
import { booksInvoiceSendingActions } from './booksInvoiceSendingActions';
=======
import { booksBillingScheduleActions } from './booksBillingScheduleActions';
>>>>>>> origin/staging
import { booksExpenseActions } from './booksExpenseActions';
import { booksExpenseReadActions } from './booksExpenseReadActions';
import { booksBankLineActions } from './booksBankLineActions';
import { booksPeriodEndActions } from './booksPeriodEndActions';
import { booksOverviewActions } from './booksOverviewActions';
import { booksDeletionActions } from './booksDeletionActions';
import { stripePaymentActions } from './stripePaymentActions';
import type { McpAction } from '../actionTypes';

export const booksActions: McpAction[] = [
	...booksReadActions,
	...booksPeriodActions,
	...booksPostingActions,
	...booksSettingsActions,
	...booksLedgerAccountActions,
	...booksLoanAccountActions,
	...booksCostCentreActions,
	...booksCustomerActions,
	...booksInvoiceActions,
	...booksInvoiceReadActions,
	...booksInvoicePostingActions,
<<<<<<< HEAD
	...booksInvoiceSendingActions,
=======
	...booksBillingScheduleActions,
>>>>>>> origin/staging
	...booksExpenseActions,
	...booksExpenseReadActions,
	...booksBankLineActions,
	...booksPeriodEndActions,
	...booksOverviewActions,
	...booksDeletionActions,
	...stripePaymentActions
];
