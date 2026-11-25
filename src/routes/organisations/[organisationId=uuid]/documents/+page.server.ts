import { documentPageActions } from '$lib/server/projectDocuments/documentPageActions';
import { loadDocumentShelf } from '$lib/server/projectDocuments/documentPageLoads';
import { reachOrganisationPage } from '$lib/server/projectDocuments/documentPageOwner';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => loadDocumentShelf(reachOrganisationPage, event);

export const actions = documentPageActions(reachOrganisationPage) satisfies Actions;
