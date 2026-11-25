import { ukClockAt } from '$lib/data/ukClock';
import { loanBudgetPanelsOf } from '$lib/data/books/page/loanBudgetRows';
import { cashflowItemRowsOf, describeCashflowStanding, forecastMonthRowsOf } from '$lib/data/books/page/cashflowRows';
import { readCashflowForecast } from '$lib/server/books/cashflowForecastReading';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PageServerLoad } from './$types';

/** The layout has already let the person into the organisation's books, so the service client may read its forecast. */
export const load: PageServerLoad = async ({ parent }) => {
	const { booksOrganisation } = await parent();
	const today = ukClockAt(new Date()).date;
	const { forecast, items, loanBudgets } = await readCashflowForecast(supabaseServiceClient(), booksOrganisation.id, today);
	return {
		standing: describeCashflowStanding(forecast, today),
		months: forecastMonthRowsOf(forecast),
		items: cashflowItemRowsOf(items),
		loanBudgets: loanBudgetPanelsOf(loanBudgets)
	};
};
