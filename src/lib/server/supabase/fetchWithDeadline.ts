import {
	millisecondsPerSecond,
	storagePathPrefix,
	supabaseDeadlines,
	type SupabaseDeadlines
} from './supabaseDeadlines';

/** Supabase took longer than its deadline to answer, so the request was abandoned rather than left to hang. */
export class SupabaseDidNotAnswer extends Error {
	constructor(readonly deadlineMilliseconds: number) {
		super(`Supabase did not answer within ${deadlineMilliseconds / millisecondsPerSecond} seconds`);
		this.name = 'SupabaseDidNotAnswer';
	}
}

/** A fetch for the Supabase clients that abandons any request Supabase has not answered by its deadline. */
export function fetchWithDeadline(
	deadlines: SupabaseDeadlines = supabaseDeadlines,
	underlyingFetch: typeof fetch = fetch
): typeof fetch {
	return async (input, init) => {
		const deadlineMilliseconds = deadlineFor(addressOf(input), deadlines);
		const deadline = AbortSignal.timeout(deadlineMilliseconds);
		const signal = withCallerSignal(deadline, init?.signal);
		try {
			return await underlyingFetch(input, { ...init, signal });
		} catch (error) {
			if (deadline.aborted) throw new SupabaseDidNotAnswer(deadlineMilliseconds);
			throw error;
		}
	};
}

function deadlineFor(address: URL, deadlines: SupabaseDeadlines): number {
	const isStorage = address.pathname.startsWith(storagePathPrefix);
	if (isStorage) return deadlines.storageMilliseconds;
	return deadlines.dataMilliseconds;
}

function addressOf(input: RequestInfo | URL): URL {
	if (input instanceof URL) return input;
	if (typeof input === 'string') return new URL(input);
	return new URL(input.url);
}

function withCallerSignal(deadline: AbortSignal, callerSignal: AbortSignal | null | undefined): AbortSignal {
	if (!callerSignal) return deadline;
	return AbortSignal.any([deadline, callerSignal]);
}
