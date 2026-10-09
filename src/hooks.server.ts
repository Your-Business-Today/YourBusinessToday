import { createServerClient } from '@supabase/ssr';
import { text } from '@sveltejs/kit';
import { isForbiddenCrossSiteForm } from '$lib/server/http/crossSiteFormSubmission';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { getUserModelOverride } from '$lib/server/anthropic/getUserModelOverride';
import { reportServerError } from '$lib/server/http/reportServerError';
import { runWithModelResolver } from '$lib/server/anthropic/modelContext';
import type { Cookies, Handle } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';

const forbidden = 403;

export const handleError = reportServerError;

export const handle: Handle = async ({ event, resolve }) => {
	if (isForbiddenCrossSiteForm(event.request, event.url)) {
		return text('Cross-site form submissions are forbidden', { status: forbidden });
	}
	const { locals } = event;
	locals.supabase = supabaseClientFor(event.cookies);
	locals.safeGetSession = () => readSession(locals);
	return runWithModelResolver(modelOverrideResolver(locals.supabase), () =>
		resolve(event, {
			filterSerializedResponseHeaders: (headerName) =>
				headerName === 'content-range' || headerName === 'x-supabase-api-version'
		})
	);
};

function supabaseClientFor(cookies: Cookies): SupabaseClient {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) =>
					cookies.set(name, value, { ...options, path: '/' })
				);
			}
		}
	});
}

async function readSession(locals: App.Locals) {
	const { auth } = locals.supabase;
	const { data: userData } = await auth.getUser();
	locals.resolvedUser = userData.user;
	if (userData.user === null) return { session: null, user: null };
	const { data: sessionData } = await auth.getSession();
	return { session: sessionData.session, user: userData.user };
}

function modelOverrideResolver(supabase: SupabaseClient): () => Promise<string | null> {
	let overrideLookup: Promise<string | null> | null = null;
	return () => {
		overrideLookup = overrideLookup ?? getUserModelOverride(supabase);
		return overrideLookup;
	};
}
