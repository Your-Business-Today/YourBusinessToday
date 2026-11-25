import { booksReadActions } from './booksReadActions';
import { booksPeriodActions } from './booksPeriodActions';
import { booksPostingActions } from './booksPostingActions';
import { booksSettingsActions } from './booksSettingsActions';
import { booksLedgerAccountActions } from './booksLedgerAccountActions';
import { booksLoanAccountActions } from './booksLoanAccountActions';
import { booksLoanAccountChangeActions } from './booksLoanAccountChangeActions';
import { booksCashflowActions } from './booksCashflowActions';
import { booksLoanBudgetActions } from './booksLoanBudgetActions';
import { booksLoanBudgetLineActions } from './booksLoanBudgetLineActions';
import { booksLoanSpendActions } from './booksLoanSpendActions';
import { booksClosingActions } from './booksClosingActions';
import { booksCostCentreActions } from './booksCostCentreActions';
import { booksCostCentreProjectActions } from './booksCostCentreProjectActions';
import { booksCostProjectionActions } from './booksCostProjectionActions';
import { booksCostShareActions } from './booksCostShareActions';
import { booksCostShareCostCentreActions } from './booksCostShareCostCentreActions';
import { booksCostShareRuleActions } from './booksCostShareRuleActions';
import { booksCostShareSyncActions } from './booksCostShareSyncActions';
import { booksCostShareUsageActions } from './booksCostShareUsageActions';
import { booksCostShareWeightActions } from './booksCostShareWeightActions';
import { booksCustomerActions } from './booksCustomerActions';
import { booksInvoiceActions } from './booksInvoiceActions';
import { booksInvoiceReadActions } from './booksInvoiceReadActions';
import { booksInvoicePostingActions } from './booksInvoicePostingActions';
import { booksInvoiceSendingActions } from './booksInvoiceSendingActions';
import { booksBillingScheduleActions } from './booksBillingScheduleActions';
import { booksBillingRunActions } from './booksBillingRunActions';
import { booksExpenseActions } from './booksExpenseActions';
import { booksExpenseReadActions } from './booksExpenseReadActions';
import { booksBankLineActions } from './booksBankLineActions';
import { booksBankLineDeletionActions } from './booksBankLineDeletionActions';
import { booksBankRuleActions } from './booksBankRuleActions';
import { booksBankLineMatchActions } from './booksBankLineMatchActions';
import { booksBankReconciliationActions } from './booksBankReconciliationActions';
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
	...booksLoanAccountChangeActions,
	...booksCashflowActions,
	...booksLoanBudgetActions,
	...booksLoanBudgetLineActions,
	...booksLoanSpendActions,
	...booksClosingActions,
	...booksCostCentreActions,
	...booksCostCentreProjectActions,
	...booksCostProjectionActions,
	...booksCostShareActions,
	...booksCostShareCostCentreActions,
	...booksCostShareRuleActions,
	...booksCostShareSyncActions,
	...booksCostShareUsageActions,
	...booksCostShareWeightActions,
	...booksCustomerActions,
	...booksInvoiceActions,
	...booksInvoiceReadActions,
	...booksInvoicePostingActions,
	...booksInvoiceSendingActions,
	...booksBillingScheduleActions,
	...booksBillingRunActions,
	...booksExpenseActions,
	...booksExpenseReadActions,
	...booksBankLineActions,
	...booksBankLineDeletionActions,
	...booksBankRuleActions,
	...booksBankLineMatchActions,
	...booksBankReconciliationActions,
	...booksPeriodEndActions,
	...booksOverviewActions,
	...booksDeletionActions,
	...stripePaymentActions
];
