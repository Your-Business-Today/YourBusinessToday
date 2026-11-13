import { completeJoineryPages, heldOf, joineryMapVersion, joineryPage, withPage } from '../../domainGaps/tests/joineryDomain';
import type { DomainCheckHeld } from '../domainCheckHeld';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

const fullBody = 'What this page says, in the business’s own words: what it is, what makes one, how it moves and where it is kept, with an example or two.';

const fieldOf = (name: string, ref: string | null = null) => ({ name, label: name, type: ref === null ? 'text' : 'ref', ref, isRequired: true, notes: '' });

/** The joinery domain with every record given its fields, so it passes the domain check as it passes every test of completeness. */
export function healthyJoineryPages(): DomainPage[] {
	const lifecycleOf = (...statuses: string[]) => statuses.map((status) => ({ status, meaning: `${status}.`, movesTo: [] }));
	const enquiry = joineryPage('enquiry', 'entity', 'Enquiry', { identity: 'A customer asking for a price.', fields: [fieldOf('Asked on')] });
	const quote = joineryPage('quote', 'entity', 'Quote', {
		identity: 'One price for one job.',
		lifecycle: lifecycleOf('Priced', 'Sent', 'Accepted'),
		fields: [fieldOf('Price'), fieldOf('Enquiry', 'enquiry')]
	});
	const joinery = joineryPage('joinery', 'entity', 'Joinery', { identity: 'One made piece.', lifecycle: lifecycleOf('Made', 'Fitted'), fields: [fieldOf('Quote', 'quote')] }, 'making');
	return [enquiry, quote, joinery].reduce(withPage, completeJoineryPages());
}

/** What the domain check reads of the pages: every page given a full body unless one is given, and the slugs retired from it. */
export function checkHeldOf(pages: DomainPage[], options: { map?: WorkflowMapVersion | null; retiredSlugs?: string[]; bodies?: Record<string, string> } = {}): DomainCheckHeld {
	const { map = joineryMapVersion(), retiredSlugs = [], bodies = {} } = options;
	const bodyOf = (page: DomainPage) => bodies[page.slug] ?? fullBody;
	return { ...heldOf(pages, map), pages, bodies: new Map(pages.map((page) => [page.pageId, bodyOf(page)])), retiredSlugs };
}
