import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const temporaryRedirect = 307;
const demoEntryPage = '/construction-demo/index.html';

export const GET: RequestHandler = () => redirect(temporaryRedirect, demoEntryPage);
