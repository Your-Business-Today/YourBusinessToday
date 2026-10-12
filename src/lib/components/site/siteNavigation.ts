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
	{ href: '/vision', label: 'What we build' },
	{ href: '/offer', label: 'The offer' },
	{ href: '/case-studies/jewel', label: 'Case study' },
	{ href: '/about', label: 'About us' },
	{ href: '/contact', label: 'Contact' }
];

const workLinks: NavigationLink[] = [
	{ href: '/projects', label: 'Projects' },
	{ href: '/projects/feed', label: 'Feed' },
	{ href: '/tasks', label: 'Tasks' },
	{ href: '/support', label: 'Support' }
];

const organisationsLink: NavigationLink = { href: '/organisations', label: 'Organisations' };

const adminLinks: NavigationLink[] = [{ href: '/admin', label: 'Admin' }];

export function buildMenuGroups(access: NavigationAccess): NavigationGroup[] {
	const groups: NavigationGroup[] = [{ label: 'Explore', links: primaryNavigationLinks }];
	const workGroup = { label: 'Work', links: workLinksFor(access) };
	if (access.isSignedIn) groups.push(workGroup);
	const businessGroup = { label: 'Business', links: businessLinks(access) };
	if (access.isStaff) groups.push(businessGroup);
	groups.push({ label: 'Account', links: accountLinks(access) });
	return groups;
}

/** Organisations join the work links for staff and for anyone an organisation has brought on. */
function workLinksFor(access: NavigationAccess): NavigationLink[] {
	if (!access.hasOrganisations && !access.isStaff) return workLinks;
	return [...workLinks, organisationsLink];
}

function businessLinks(access: NavigationAccess): NavigationLink[] {
	return [
		{ href: '/clients', label: 'Clients' },
		{ href: '/people', label: 'People' },
		{ href: '/clients/patches', label: 'Patches' },
		{ href: '/clients/feed', label: 'Patch feed' },
		...(access.isAdmin ? adminLinks : [])
	];
}

function accountLinks(access: NavigationAccess): NavigationLink[] {
	if (!access.isSignedIn) return [{ href: '/account/sign-in', label: 'Sign in' }];
	return [{ href: '/account', label: 'Account' }];
}
