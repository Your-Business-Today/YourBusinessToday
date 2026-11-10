import { everywherePath } from './mediumDefinition';

export function parentPathOf(path: string): string {
	const lastDot = path.lastIndexOf('.');
	if (lastDot === -1) return everywherePath;
	return path.slice(0, lastDot);
}

export function depthOf(path: string): number {
	if (path === everywherePath) return 0;
	return path.split('.').length;
}

export function isWithinPath(path: string, scopePath: string): boolean {
	if (scopePath === everywherePath) return true;
	return path === scopePath || path.startsWith(`${scopePath}.`);
}
