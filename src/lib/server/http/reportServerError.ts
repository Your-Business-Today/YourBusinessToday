import type { HandleServerError } from '@sveltejs/kit';
import { recordServerError } from '$lib/server/serverErrors/recordServerError';
import type { ServerErrorRecord } from '$lib/server/serverErrors/serverErrorRecord';

const referenceLength = 8;
const notFound = 404;

export const reportServerError: HandleServerError = async ({ error, event, status, message }) => {
	if (status === notFound) return { message };
	const reference = crypto.randomUUID().slice(0, referenceLength);
	const { route, url, request, locals } = event;
	const user = locals.resolvedUser;
	const cause = describeCause(error);
	const record: ServerErrorRecord = {
		reference,
		occurredAt: new Date().toISOString(),
		routeId: route.id,
		pathname: url.pathname,
		method: request.method,
		userId: user?.id ?? null,
		status,
		message,
		causeMessage: cause.message,
		causeStack: cause.stack
	};
	console.error(JSON.stringify({ level: 'error', ...record }));
	await recordServerError(record);
	return { message: `Something went wrong (ref ${reference})` };
};

function describeCause(error: unknown): { message: string; stack: string | null } {
	if (error instanceof Error) return { message: error.message, stack: error.stack ?? null };
	return { message: describeThrownValue(error), stack: null };
}

function describeThrownValue(thrown: unknown): string {
	if (typeof thrown !== 'object' || thrown === null) return String(thrown);
	return JSON.stringify(thrown);
}
