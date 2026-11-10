import { portalOrganisationParameter } from '$lib/portal/portalVisitor';
import { requirePortalVisitor } from './requirePortalVisitor';
import { switchPortalOrganisation } from './switchPortalOrganisation';
import type { Cookies } from '@sveltejs/kit';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

type LinkedPortalPage = { locals: App.Locals; url: URL; cookies: Cookies };

/**
 * The signed-in client contact, working in the organisation a link names when it names one of theirs, so a page
 * given its organisation opens on it and the portal stays there afterwards.
 */
export async function requireLinkedPortalVisitor({ locals, url, cookies }: LinkedPortalPage): Promise<PortalVisitor> {
	const linkedClientId = url.searchParams.get(portalOrganisationParameter);
	if (linkedClientId !== null) locals.portalOrganisationId = linkedClientId;
	const visitor = await requirePortalVisitor(locals);
	if (linkedClientId !== null) switchPortalOrganisation(visitor, linkedClientId, cookies);
	return visitor;
}
