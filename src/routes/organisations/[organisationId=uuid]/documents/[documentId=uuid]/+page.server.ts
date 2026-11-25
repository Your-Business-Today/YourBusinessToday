import { loadDocumentReading } from '$lib/server/projectDocuments/documentPageLoads';
import { reachOrganisationPage } from '$lib/server/projectDocuments/documentPageOwner';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => loadDocumentReading(reachOrganisationPage, event);
