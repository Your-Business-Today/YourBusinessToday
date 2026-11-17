/** How long the server waits for Supabase to answer one request before giving up, well inside Vercel's 300 second limit. */
export type SupabaseDeadlines = {
	readonly dataMilliseconds: number;
	readonly storageMilliseconds: number;
};

export const millisecondsPerSecond = 1000;

export const supabaseDeadlines: SupabaseDeadlines = {
	dataMilliseconds: 30 * millisecondsPerSecond,
	storageMilliseconds: 90 * millisecondsPerSecond
};

export const storagePathPrefix = '/storage/v1/';
