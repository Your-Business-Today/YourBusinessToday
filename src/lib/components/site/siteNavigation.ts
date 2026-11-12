import { caseStudyPath } from '$lib/data/caseStudies';
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
	{ href: '/offer', label: 'The offer' },
	{ href: caseStudyPath, label: 'Case study' },
	{ href: taxCalculatorPath, label: taxCalculatorLabel },
	{ href: '/about', label: 'About us' },
	{ href: discoveryCallPath, label: discoveryCallShortLabel }
];

export const projectsLink: NavigationLink = { href: '/projects', label: 'Projects' };

export const organisationsLink: NavigationLink = { href: '/organisations', label: 'Organisations' };

export const leadsLink: NavigationLink = { href: '/leads', label: 'Leads' };

export const clientsLink: NavigationLink = { href: '/clients', label: 'Clients' };

export const adminLink: NavigationLink = { href: '/admin', label: 'Admin' };

const accountLink: NavigationLink = { href: '/account', label: 'Account' };

export function buildMenuGroups(access: NavigationAccess): NavigationGroup[] {
	const groups: NavigationGroup[] = [{ label: 'Explore', links: primaryNavigationLinks }];
	const workGroup = { label: 'Work', links: workLinksFor(access) };
	if (access.isSignedIn) groups.push(workGroup);
	const businessGroup = { label: 'Business', links: businessLinksFor(access) };
	if (access.isStaff) groups.push(businessGroup);
	groups.push({ label: 'Account', links: accountLinksFor(access) });
	return groups;
}

/** Staff, and anyone an organisation has brought on, reach the organisations. */
export function canSeeOrganisations(access: NavigationAccess): boolean {
	return access.hasOrganisations || access.isStaff;
}

export function workLinksFor(access: NavigationAccess): NavigationLink[] {
	if (!canSeeOrganisations(access)) return [projectsLink];
	return [projectsLink, organisationsLink];
}

/** The sales pages sit in an organisation's Sales module, not here. */
export function businessLinksFor(access: NavigationAccess): NavigationLink[] {
	if (!access.isAdmin) return [leadsLink, clientsLink];
	return [leadsLink, clientsLink, adminLink];
}

export function accountLinksFor(access: NavigationAccess): NavigationLink[] {
	if (!access.isSignedIn) return [{ href: '/account/sign-in', label: 'Sign in' }];
	return [accountLink];
}
