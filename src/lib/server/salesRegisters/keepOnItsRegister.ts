import { redirect } from '@sveltejs/kit';
import { registerOfStage } from '$lib/data/salesRegisters';
import type { ClientStage } from '$lib/data/clientLifecycle';

const temporaryRedirect = 307;

/**
 * A company's page is shown under the register its stage puts it on, so a lead opened by an old /clients/<id>
 * link moves to /leads/<id>, and a lead that has since signed moves back. The redirect is temporary because the
 * stage, and so the register, can change.
 */
export function keepOnItsRegister(url: URL, registerSegment: string, stage: ClientStage): void {
	const { path } = registerOfStage(stage);
	const requestedPath = `/${registerSegment}`;
	if (requestedPath === path) return;
	const pathOnItsRegister = `${path}${url.pathname.slice(requestedPath.length)}`;
	redirect(temporaryRedirect, `${pathOnItsRegister}${url.search}`);
}
