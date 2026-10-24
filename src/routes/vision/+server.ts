import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const permanentRedirect = 308;
const homePath = '/';

/** The What we build page is gone; its address goes to the homepage, which says what we do. */
export const GET: RequestHandler = () => redirect(permanentRedirect, homePath);
