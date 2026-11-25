import { downloadDocument } from '$lib/server/projectDocuments/documentPageLoads';
import { reachOrganisationPage } from '$lib/server/projectDocuments/documentPageOwner';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => downloadDocument(reachOrganisationPage, event);
