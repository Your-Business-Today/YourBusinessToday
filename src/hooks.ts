import { configuredPortalHost } from '$lib/portal/configuredPortalHost';
import { portalReroute } from '$lib/portal/siteDoors';
import type { Reroute } from '@sveltejs/kit';

export const reroute: Reroute = ({ url }) => portalReroute(url, configuredPortalHost());
