import { redirect } from '@sveltejs/kit';
import { constructionCompanyCaseStudy } from '$lib/data/caseStudies';
import type { RequestHandler } from './$types';

const permanentRedirect = 308;

/** The case study used to carry the client's name in its address; the old address still reaches it. */
export const GET: RequestHandler = () => redirect(permanentRedirect, constructionCompanyCaseStudy.href);
