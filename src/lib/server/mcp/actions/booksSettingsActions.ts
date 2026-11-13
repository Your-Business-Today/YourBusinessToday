import type { SupabaseClient } from '@supabase/supabase-js';
import { findBooksSettings, saveBooksSettings } from '$lib/server/books/booksSettings';
import { findFinancialYear } from '$lib/server/books/financialYear';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { booksSettingsFields } from './booksSettingsFields';
import { describeBooksSettings } from './describeBooksSettings';
import type { McpAction } from '../actionTypes';

const changeOnlyWhatThePersonSaid =
	'Change only the settings the person asked to change, in their words, and leave every other one out so it ' +
	'keeps what the books hold. Never fill in a company detail, bank detail or number they did not give; ask ' +
	'them instead. Bank details print on every invoice, so read them back to the person before saving. The next ' +
	'invoice number only moves forward past invoices already numbered. A new company whose first accounts run longer ' +
	'than a year gives firstPeriodStart and firstPeriodEnd together, from its incorporation certificate and first year end.';

async function describeSettingsOf(supabase: SupabaseClient, organisation: { id: string; name: string }): Promise<string> {
	const [settings, financialYear] = await Promise.all([
		findBooksSettings(supabase, organisation.id),
		findFinancialYear(supabase, organisation.id)
	]);
	return describeBooksSettings(organisation.name, settings, financialYear);
}

export const booksSettingsActions: McpAction[] = [
	moduleAction('books', {
		name: 'read_books_settings',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read an organisation's books settings: company and bank details as they print on an invoice, payment terms, financial year and invoice numbering",
		guidance: 'Give the person the settings as the books hold them; one shown as not set is empty, never guess it.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) => describeSettingsOf(caller.supabase, organisation)
	}),
	moduleAction('books', {
		name: 'change_books_settings',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "change an organisation's books settings: company or bank details, payment terms, financial year start, first accounting period, or invoice prefix and next number",
		guidance: changeOnlyWhatThePersonSaid,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...booksSettingsFields }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				await saveBooksSettings(caller.supabase, organisation.id, input);
				return `Saved. ${await describeSettingsOf(caller.supabase, organisation)}`;
			})
	})
];
