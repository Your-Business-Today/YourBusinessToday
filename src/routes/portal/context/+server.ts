import { redirect } from '@sveltejs/kit';
import { portalWorkflowMapPath } from '$lib/portal/portalPaths';
import type { RequestHandler } from './$types';

const permanentRedirect = 308;

/** Your company context is gone; its address goes to Your workflow map, which does what it did. */
export const GET: RequestHandler = () => redirect(permanentRedirect, portalWorkflowMapPath);
