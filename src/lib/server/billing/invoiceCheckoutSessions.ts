import type { SupabaseClient } from '@supabase/supabase-js';
import { validateCheckoutSessionId } from '$lib/data/billing/checkoutSessionRules';
import { invoicesTable } from '$lib/server/books/invoiceRecord';

/** One invoice in one organisation's books. */
export type BooksInvoicePlace = { organisationId: string; invoiceId: string };

/** The Checkout session an invoice keeps (migration 0178): which it holds, and swapping it for a newer one. */
export type InvoiceCheckoutSessions = {
	findHeld: (place: BooksInvoicePlace) => Promise<string | null>;
	replaceHeld: (place: BooksInvoicePlace, heldSessionId: string | null, newSessionId: string) => Promise<boolean>;
};

const sessionColumn = 'stripe_checkout_session_id';

type SessionRow = { stripe_checkout_session_id: string | null };

/** The sessions kept in the books, read and written with the service key once the client has been let in. */
export function booksCheckoutSessions(service: SupabaseClient): InvoiceCheckoutSessions {
	return {
		findHeld: (place) => findHeldSession(service, place),
		replaceHeld: (place, heldSessionId, newSessionId) => replaceHeldSession(service, place, heldSessionId, newSessionId)
	};
}

async function findHeldSession(service: SupabaseClient, place: BooksInvoicePlace): Promise<string | null> {
	const { data, error } = await service.from(invoicesTable).select(sessionColumn).eq('organisation_id', place.organisationId).eq('id', place.invoiceId).single();
	if (error !== null) throw error;
	return (data as SessionRow).stripe_checkout_session_id;
}

/**
 * Keeps the new session only while the invoice still holds the one it was opened in place of, and says whether it did:
 * when two presses open two sessions at once, one is kept and the other is the caller's to expire.
 */
async function replaceHeldSession(service: SupabaseClient, place: BooksInvoicePlace, heldSessionId: string | null, newSessionId: string): Promise<boolean> {
	const refusal = validateCheckoutSessionId(newSessionId);
	if (refusal !== null) throw new Error(refusal);
	const update = service.from(invoicesTable).update({ [sessionColumn]: newSessionId }).eq('organisation_id', place.organisationId).eq('id', place.invoiceId);
	const stillHeld = heldSessionId === null ? update.is(sessionColumn, null) : update.eq(sessionColumn, heldSessionId);
	const { data, error } = await stillHeld.select('id');
	if (error !== null) throw error;
	return data.length > 0;
}
