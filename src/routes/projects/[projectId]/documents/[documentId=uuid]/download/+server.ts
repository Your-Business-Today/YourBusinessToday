import { downloadDocument } from '$lib/server/projectDocuments/documentPageLoads';
import { reachProductPage } from '$lib/server/projectDocuments/documentPageOwner';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => downloadDocument(reachProductPage, event);
