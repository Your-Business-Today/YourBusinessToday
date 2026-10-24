import { redirect } from '@sveltejs/kit';
import { caseStudyPath } from '$lib/data/caseStudies';
import type { RequestHandler } from './$types';

const permanentRedirect = 308;

/** The case study used to live under /case-studies, first by the client's name and then by its kind; every old address reaches it. */
export const GET: RequestHandler = () => redirect(permanentRedirect, caseStudyPath);
