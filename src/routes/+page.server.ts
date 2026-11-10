import { redirect } from '@sveltejs/kit';
import { isAtPortalAddress } from '$lib/portal/portalAddress';
import { portalAddressDoor } from '$lib/server/portal/portalAddressDoor';
import type { PageServerLoad } from './$types';

const seeOther = 303;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!isAtPortalAddress(url)) return {};
	redirect(seeOther, await portalAddressDoor(locals));
};
