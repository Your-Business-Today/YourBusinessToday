import { businessBrainDomainActions } from './businessBrainDomainActions';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

/** A manager of Jewel whose connection keeps the links it is asked to keep, and a context and a page of its domain, as the domain filing tests use them. */
function managerOfJewel(linksKept: Record<string, unknown>[]): McpCaller {
	const supabase = {
		from: () => ({
			upsert: async (link: Record<string, unknown>) => {
				linksKept.push(link);
				return { error: null };
			}
		})
	};
	const organisationMemberships = [{ organisationId: 'jewel', accountId: 'nigel', isManager: true }];
	return { accountId: 'nigel', isStaff: false, supabase, organisationMemberships } as unknown as McpCaller;
}

export const clientWork = { slug: 'client-work', name: 'Client work', summary: 'Jobs done for clients', isCoreDomain: true };

export const job = { kind: 'entity', slug: 'job', title: 'Job', summary: 'Work for a client', body: 'A job is…', contextSlug: 'client-work' };

export const money = { slug: 'money', name: 'Money', summary: 'Getting paid', subdomain: 'generic' };

export const contractStack = { ...job, slug: 'contract-stack', title: 'Contract stack', statuses: ['Drafted', 'Signed'] };

export const signedWord = { word: 'signed contract stack', meaning: 'A stack the client signed', namesThingSlug: 'contract-stack', namesStatus: 'Signed' };

export const clientWorkGlossary = { ...job, kind: 'glossary', slug: 'client-work-glossary', title: 'Client work words', terms: [signedWord] };

export const invoicesPassed = { fromContextSlug: 'client-work', toContextSlug: 'money', passes: 'Invoices', pattern: 'conformist' };

export const contextMap = { kind: 'context_map', slug: 'context-map', title: 'Context map', summary: '', body: 'Client work feeds Money.', relationships: [invoicesPassed] };

/** The links a filing asked the manager's connection to keep. */
export const linksKept: Record<string, unknown>[] = [];

const nigel = managerOfJewel(linksKept);

const fileDomainAction = businessBrainDomainActions.find((action) => action.name === 'file_business_brain_domain') as McpAction;

/** Files into Jewel's domain as its manager, from the staff handbook unless another source is named. */
export function fileDomain(input: Record<string, unknown>) {
	return fileDomainAction.run(nigel, { organisationId: 'jewel', sourceTitle: 'Staff handbook', ...input });
}
