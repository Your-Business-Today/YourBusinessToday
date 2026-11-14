import type { SupabaseClient } from '@supabase/supabase-js';
import { LedgerAccountTypes } from '$lib/data/books/ledgerAccountTypes';
import type { BillingChoice } from '$lib/data/books/organisationBilling';
import { findChartOfAccounts } from '../chartOfAccounts';
import type { OwnBooks } from '../ownBooks';

/** What a schedule's line can post to and be kept within: the books' income accounts and cost centres still in use. */
export type BillingChoices = { incomeAccounts: BillingChoice[]; costCentres: BillingChoice[] };

/** The income accounts in code order and the cost centres by name, archived ones left out. */
export async function findBillingChoices(service: SupabaseClient, books: OwnBooks): Promise<BillingChoices> {
	const chart = await findChartOfAccounts(service, books.id);
	const incomeAccounts = chart.accounts.filter((account) => account.accountType === LedgerAccountTypes.income && !account.isArchived);
	const costCentres = chart.costCentres.filter((costCentre) => !costCentre.isArchived);
	return {
		incomeAccounts: incomeAccounts.map((account) => ({ id: account.id, label: `${account.code} ${account.name}` })),
		costCentres: costCentres.map((costCentre) => ({ id: costCentre.id, label: costCentre.name }))
	};
}
