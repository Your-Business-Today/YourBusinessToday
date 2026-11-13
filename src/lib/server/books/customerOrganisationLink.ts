import type { SupabaseClient } from '@supabase/supabase-js';
import { billedOrganisationPlaceRefusal, type ClientLinkPlace } from '$lib/data/books/clientRegisterLink';
import { validateRecordId } from '$lib/data/isUuid';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { BooksRefusal, refuseWhen } from './booksRefusal';

/** Who is linking the customer, and in which organisation's books, since those books never bill themselves. */
export type BilledOrganisationPlace = ClientLinkPlace & { booksOrganisationId: string };

const PostgresErrors = { uniqueViolation: '23505' } as const;

const billedOrganisationIndex = 'books_customers_one_per_billed_organisation';

/**
 * The client organisation a customer is to stand for, or null to stand for none; refused unless these are Your Business
 * Today's own books and its staff ask, and unless the organisation is another one that exists.
 */
export async function resolveBilledOrganisationLink(supabase: SupabaseClient, place: BilledOrganisationPlace, organisationId: unknown): Promise<string | null> {
	if (organisationId === null) return null;
	const writtenId = typeof organisationId === 'string' ? organisationId : JSON.stringify(organisationId);
	refuseWhen(validateRecordId('billed organisation', writtenId));
	refuseWhen(billedOrganisationPlaceRefusal(place));
	const isTheBooksThemselves = writtenId === place.booksOrganisationId;
	if (isTheBooksThemselves) throw new BooksRefusal(`${place.organisationName}'s books do not bill ${place.organisationName}; give a client organisation.`);
	const organisation = await getOrganisation(supabase, writtenId);
	if (organisation === null) throw new BooksRefusal(`No organisation ${writtenId} is on ${place.organisationName}; list_organisations lists them.`);
	return organisation.id;
}

/** The refusal the database's own check gives when a second customer was to stand for the same organisation. */
export function billedOrganisationTakenRefusal(error: { code?: string; message?: string }): string | null {
	const isThisIndex = error.code === PostgresErrors.uniqueViolation && String(error.message ?? '').includes(billedOrganisationIndex);
	if (!isThisIndex) return null;
	return 'Another customer in these books already stands for that organisation; one customer bills each, and list_customer_balances lists them.';
}
