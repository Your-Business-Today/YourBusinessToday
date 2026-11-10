import { websiteDirectoryHosts } from './websiteDirectoryHosts';

export function isDirectoryOrSocialSite(hostname: string): boolean {
	const siteName = hostname.toLowerCase();
	return websiteDirectoryHosts.some((host) => siteName === host || siteName.endsWith(`.${host}`));
}
