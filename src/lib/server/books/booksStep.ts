import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * A step of the database that makes one move of the books whole: its name, what it is given, how to tell afterwards
 * whether it happened, the move in words ("invoice INV-6 was issued") and where to read how the record stands.
 */
export type BooksStep = {
	name: string;
	inputs: Record<string, unknown>;
	hasHappened: () => Promise<boolean>;
	move: string;
	whereItStands: string;
};

/** A step whose answer did not come back and whose outcome could not be told: read the record before asking again. */
export class UnsettledBooksStep extends Error {}

/**
 * Runs the step and answers whether it made its move, or false when the record no longer stood as the server read it
 * and nothing was changed. When the answer does not come back, whether the move happened is looked for rather than
 * assumed, and nothing is ever taken back; when it cannot be told, the error says to read the record before asking again.
 */
export async function runBooksStep(supabase: SupabaseClient, step: BooksStep): Promise<boolean> {
	const answer = await supabase.rpc(step.name, step.inputs);
	if (answer.error === null) return answer.data === true;
	if (await isKnownToHaveHappened(step)) return true;
	const failure = messageOf(answer.error);
	const advice = `${step.whereItStands}; read it before asking again, so nothing is posted twice.`;
	throw new UnsettledBooksStep(`It could not be told whether ${step.move} (${failure}). ${advice}`);
}

async function isKnownToHaveHappened(step: BooksStep): Promise<boolean> {
	try {
		return await step.hasHappened();
	} catch {
		return false;
	}
}

/** What a failure says, whether it is an error or a database's answer with a message. */
export function messageOf(failure: unknown): string {
	const message = (failure as { message?: unknown } | null)?.message;
	return String(message ?? failure);
}
