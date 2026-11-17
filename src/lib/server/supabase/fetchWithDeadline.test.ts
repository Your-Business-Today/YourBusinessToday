import { describe, expect, it } from 'vitest';
import { fetchWithDeadline, SupabaseDidNotAnswer } from './fetchWithDeadline';

const shortDeadlines = { dataMilliseconds: 20, storageMilliseconds: 200 };
const supabaseOrigin = 'https://project.supabase.co';
const dataAddress = `${supabaseOrigin}/rest/v1/tasks?select=id`;
const storageAddress = `${supabaseOrigin}/storage/v1/object/attachments/report.pdf`;

function supabaseThatNeverAnswers(): typeof fetch {
	return (_input, init) =>
		new Promise<Response>((_resolve, reject) => {
			const signal = init?.signal;
			signal?.addEventListener('abort', () => reject(signal.reason));
		});
}

function supabaseThatAnswersAfter(milliseconds: number): typeof fetch {
	return (_input, init) =>
		new Promise<Response>((resolve, reject) => {
			const signal = init?.signal;
			const answer = setTimeout(() => resolve(new Response('[]')), milliseconds);
			signal?.addEventListener('abort', () => {
				clearTimeout(answer);
				reject(signal.reason);
			});
		});
}

describe('fetchWithDeadline', () => {
	it('gives up on a data request Supabase has not answered by its deadline, saying so plainly', async () => {
		const supabaseFetch = fetchWithDeadline(shortDeadlines, supabaseThatNeverAnswers());
		const request = supabaseFetch(dataAddress);
		await expect(request).rejects.toBeInstanceOf(SupabaseDidNotAnswer);
		await expect(request).rejects.toThrow('Supabase did not answer within 0.02 seconds');
	});

	it('hands back an answer that arrives inside the deadline', async () => {
		const supabaseFetch = fetchWithDeadline(shortDeadlines, supabaseThatAnswersAfter(1));
		const response = await supabaseFetch(dataAddress);
		expect(await response.text()).toBe('[]');
	});

	it('gives storage the longer deadline, so a file still on its way is not cut off', async () => {
		const supabaseFetch = fetchWithDeadline(shortDeadlines, supabaseThatAnswersAfter(60));
		const response = await supabaseFetch(new URL(storageAddress));
		expect(await response.text()).toBe('[]');
	});

	it('still honours the caller’s own cancellation, which is not a stall', async () => {
		const supabaseFetch = fetchWithDeadline(shortDeadlines, supabaseThatNeverAnswers());
		const cancellation = new AbortController();
		const request = supabaseFetch(new Request(storageAddress), { signal: cancellation.signal });
		cancellation.abort(new Error('the caller cancelled'));
		await expect(request).rejects.toThrow('the caller cancelled');
	});
});
