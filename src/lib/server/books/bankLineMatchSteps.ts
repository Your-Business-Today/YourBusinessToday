import type { SupabaseClient } from '@supabase/supabase-js';
import type { BankLineMatchField, BankLineMatchKind } from '$lib/data/books/bankLineMatchRules';
import type { HeldBankLine } from './heldBankLine';
import { prepareCostMatch, prepareInvoicePaymentMatch } from './bankLinePostingMatches';
import { prepareAccountMatch, prepareExistingJournalMatch } from './bankLineJournalMatches';

/**
 * A match made ready: the step of the database that posts it and ties the line, what that step is given beside the line
 * and who matched it, the journal the line will be tied to, the kind, and what the line was in the person's words.
 */
export type PreparedBankLineMatch = {
	stepName: string;
	inputs: Record<string, unknown>;
	journalId: string;
	matchedAs: BankLineMatchKind;
	whatItWas: string;
};

type MatchPreparation = (
	supabase: SupabaseClient,
	organisationId: string,
	line: HeldBankLine,
	details: Record<string, unknown>
) => Promise<PreparedBankLineMatch>;

/** How each kind of match is made ready, by the field of match_bank_line that names it. */
export const matchPreparations: Record<BankLineMatchField, MatchPreparation> = {
	invoicePayment: prepareInvoicePaymentMatch,
	cost: prepareCostMatch,
	account: prepareAccountMatch,
	existingJournal: prepareExistingJournalMatch
};
