import { caseStudyPath } from '$lib/data/caseStudies';
import { whatWeDoLabel, whatWeDoPath } from '$lib/data/consultancyOffer';
import { discoveryCallPath, discoveryCallShortLabel } from '$lib/data/discoveryCall';
import { taxCalculatorLabel, taxCalculatorPath } from '$lib/data/taxCalculator/taxCalculatorPath';

export type NavigationLink = {
	href: string;
	label: string;
};

export type NavigationGroup = {
	label: string;
	links: NavigationLink[];
};

export type NavigationAccess = {
	isSignedIn: boolean;
	isStaff: boolean;
	isAdmin: boolean;
	hasOrganisations: boolean;
};

export const primaryNavigationLinks: NavigationLink[] = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About us' },
	{ href: whatWeDoPath, label: whatWeDoLabel },
	{ href: caseStudyPath, label: 'Case study' },
	{ href: discoveryCallPath, label: discoveryCallShortLabel }
];

/** Tools a business can use on the main site without the rest of Your Business Today; a new one is a new link here. */
export const businessToolLinks: NavigationLink[] = [{ href: taxCalculatorPath, label: taxCalculatorLabel }];

export const projectsLink: NavigationLink = { href: '/projects', label: 'Projects' };

export const organisationsLink: NavigationLink = { href: '/organisations', label: 'Organisations' };

export const leadsLink: NavigationLink = { href: '/leads', label: 'Leads' };

export const clientsLink: NavigationLink = { href: '/clients', label: 'Clients' };

export const adminLink: NavigationLink = { href: '/admin', label: 'Admin' };

const accountLink: NavigationLink = { href: '/account', label: 'Account' };

/** The main site's menu: its public pages alone, since everything signed in lives at the portal. */
export const siteMenuGroups: NavigationGroup[] = [
	{ label: 'Explore', links: primaryNavigationLinks },
	{ label: 'Business tools', links: businessToolLinks }
];

/** Staff, and anyone an organisation has brought on, reach the organisations. */
export function canSeeOrganisations(access: NavigationAccess): boolean {
	return access.hasOrganisations || access.isStaff;
}

export function accountLinksFor(access: NavigationAccess): NavigationLink[] {
	if (!access.isSignedIn) return [{ href: '/account/sign-in', label: 'Sign in' }];
	return [accountLink];
}
