import { AsyncLocalStorage } from 'node:async_hooks';
import type { MeteredCall } from '$lib/data/anthropicUsage';

type ModelResolver = () => Promise<string | null>;

type RequestModelContext = { resolveOverride: ModelResolver; meteredCalls: MeteredCall[] };

const modelContextStorage = new AsyncLocalStorage<RequestModelContext>();

export function runWithModelResolver<T>(resolveOverride: ModelResolver, run: () => T): T {
	return modelContextStorage.run({ resolveOverride, meteredCalls: [] }, run);
}

export async function requestModelOverride(): Promise<string | null> {
	const context = modelContextStorage.getStore();
	if (context === undefined) return null;
	return context.resolveOverride();
}

// Every Anthropic call made while handling the request lands here, so an
// endpoint can price what the question actually cost once it is answered.
export function recordMeteredCall(call: MeteredCall): void {
	modelContextStorage.getStore()?.meteredCalls.push(call);
}
