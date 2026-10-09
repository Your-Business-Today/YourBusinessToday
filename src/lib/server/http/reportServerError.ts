import type { HandleServerError } from '@sveltejs/kit';

const referenceLength = 8;
const notFound = 404;

export const reportServerError: HandleServerError = ({ error, event, status, message }) => {
	if (status === notFound) return { message };
	const reference = crypto.randomUUID().slice(0, referenceLength);
	const { route, url, request, locals } = event;
	const user = locals.resolvedUser;
	console.error(
		JSON.stringify({
			level: 'error',
			reference,
			routeId: route.id,
			pathname: url.pathname,
			method: request.method,
			userId: user?.id ?? null,
			status,
			message,
			cause: describeCause(error)
		})
	);
	return { message: `Something went wrong (ref ${reference})` };
};

function describeCause(error: unknown): { message: string; stack: string | null } {
	if (error instanceof Error) return { message: error.message, stack: error.stack ?? null };
	return { message: String(error), stack: null };
}
