import { githubHeaders, githubMediaTypes } from '$lib/server/kit/readRepositoryFile';

const githubGraphqlAddress = 'https://api.github.com/graphql';
const refusedWithinOkAnswer = 200;

/** What GitHub refused and why, in its own words, so the deploy window can say so on the project. */
export class GithubRefusal extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(`GitHub answered ${status}: ${message}`);
		this.status = status;
	}
}

type GithubErrorBody = { message?: string; errors?: { message?: string }[] };

export async function githubGet<Answer>(address: string): Promise<Answer> {
	return requestGithub<Answer>(address, { method: 'GET' });
}

export async function githubPost<Answer>(address: string, body: unknown): Promise<Answer> {
	return requestGithub<Answer>(address, { method: 'POST', body: JSON.stringify(body) });
}

export async function githubPut<Answer>(address: string, body: unknown): Promise<Answer> {
	return requestGithub<Answer>(address, { method: 'PUT', body: JSON.stringify(body) });
}

/** One GraphQL call; GitHub answers 200 with an errors list when the mutation is refused, so that is a refusal too. */
export async function githubGraphql<Data>(query: string, variables: Record<string, unknown>): Promise<Data> {
	const answer = await githubPost<{ data?: Data } & GithubErrorBody>(githubGraphqlAddress, { query, variables });
	const refusals = answer.errors ?? [];
	if (refusals.length > 0) throw refusalOf(refusedWithinOkAnswer, answer);
	return answer.data as Data;
}

async function requestGithub<Answer>(address: string, init: RequestInit): Promise<Answer> {
	const headers = { ...githubHeaders(githubMediaTypes.json), 'Content-Type': 'application/json' };
	const response = await fetch(address, { ...init, headers });
	const body = await readBody(response);
	if (!response.ok) throw refusalOf(response.status, body);
	return body as Answer;
}

async function readBody(response: Response): Promise<unknown> {
	const text = await response.text();
	if (text === '') return {};
	try {
		return JSON.parse(text);
	} catch {
		return { message: text };
	}
}

function refusalOf(status: number, body: unknown): GithubRefusal {
	return new GithubRefusal(status, refusalMessage(body));
}

function refusalMessage(body: unknown): string {
	const { message, errors } = (body ?? {}) as GithubErrorBody;
	const errorMessages = (errors ?? []).map((error) => error.message ?? '').filter((text) => text !== '');
	return [message ?? '', ...errorMessages].filter((text) => text !== '').join('; ') || 'no reason given';
}
