import { redirect } from '@sveltejs/kit';
import { demoPortalUrl } from '$lib/data/portalScreens';
import type { RequestHandler } from './$types';

const permanentRedirect = 308;

/** The demo portal used to carry the client's name in its address; the old address still reaches it. */
export const GET: RequestHandler = () => redirect(permanentRedirect, demoPortalUrl);
