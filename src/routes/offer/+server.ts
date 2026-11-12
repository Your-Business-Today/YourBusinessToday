import { redirect } from '@sveltejs/kit';
import { whatWeDoPath } from '$lib/data/consultancyOffer';
import type { RequestHandler } from './$types';

const permanentRedirect = 308;

/** The page used to be called the offer, at /offer; links already shared still reach it. */
export const GET: RequestHandler = () => redirect(permanentRedirect, whatWeDoPath);
