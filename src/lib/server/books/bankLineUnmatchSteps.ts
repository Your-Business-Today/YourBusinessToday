import type { SupabaseClient } from '@supabase/supabase-js';
import { BankLineMatchKinds, type BankLineMatchKind } from '$lib/data/books/bankLineMatchRules';
import type { MatchedBankLine } from './heldBankLine';
import { prepareCostUnmatch, prepareInvoicePaymentUnmatch } from './bankLinePostingUnmatches';
import { prepareAccountUnmatch, prepareExistingJournalUnmatch } from './bankLineJournalUnmatches';

/**
 * A match made ready to come off: the step of the database that withdraws what it posted and unties the line, what
 * that step is given beside the line and the journal it is tied to, and what was undone in the person's words.
 */
export type PreparedBankLineUnmatch = {
	stepName: string;
	inputs: Record<string, unknown>;
	whatWasUndone: string;
};

/** Who took the match off, by their account. */
export type UnmatchedBy = { accountId: string };

type UnmatchPreparation = (
	supabase: SupabaseClient,
	organisationId: string,
	line: MatchedBankLine,
	unmatchedBy: UnmatchedBy
) => Promise<PreparedBankLineUnmatch>;

/** How each kind of match is made ready to come off, by what the line was matched as. */
export const unmatchPreparations: Record<BankLineMatchKind, UnmatchPreparation> = {
	[BankLineMatchKinds.invoicePayment]: prepareInvoicePaymentUnmatch,
	[BankLineMatchKinds.cost]: prepareCostUnmatch,
	[BankLineMatchKinds.account]: prepareAccountUnmatch,
	[BankLineMatchKinds.existingJournal]: prepareExistingJournalUnmatch
};
