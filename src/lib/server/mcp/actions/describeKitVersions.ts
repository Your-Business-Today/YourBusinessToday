import { describeKitStanding, kitStandings, type KitReading } from '$lib/data/kitVersion';
import { formatBritishDateTime } from '$lib/data/britishDate';
import type { KitVersionEntry, KitVersionRegister } from '$lib/server/kit/getKitVersionRegister';

export const noRepositoriesYet = 'No project of yours has a repository recorded yet.';
const latestNotReadYet = 'The latest kit version has not been read yet — refresh_kit_versions reads it now.';
const neverRead = 'never read';

/** The register as the Kit versions page shows it: the summary line, then a line per repository, behind first. */
export function describeKitVersionRegister(register: KitVersionRegister): string {
	const { entries, latestKitVersion, projectsWithoutRepository } = register;
	if (entries.length === 0) return noRepositoriesYet;
	const lines = [summaryLine(register), ...entries.map((entry) => entryLine(entry, latestKitVersion))];
	if (projectsWithoutRepository > 0) lines.push(`${projectsWithoutRepository} more project(s) have no repository recorded, so they carry no kit.`);
	return lines.join('\n');
}

function summaryLine({ entries, latestKitVersion }: KitVersionRegister): string {
	if (latestKitVersion === '') return latestNotReadYet;
	const behindCount = entries.filter((entry) => entry.standing === kitStandings.behind).length;
	const currentCount = entries.filter((entry) => entry.standing === kitStandings.current).length;
	return `${currentCount} of ${entries.length} repositories on the latest kit ${latestKitVersion}; ${behindCount} behind.`;
}

function entryLine(entry: KitVersionEntry, latestKitVersion: string): string {
	const { projectName, projectId, repositoryUrl, kitVersion, kitVersionReadAt, standing } = entry;
	const reading: KitReading = { hasRepository: true, isRead: kitVersionReadAt !== null, kitVersion, latestKitVersion };
	const readAt = kitVersionReadAt === null ? neverRead : `read ${formatBritishDateTime(kitVersionReadAt)}`;
	return `${projectName} — ${describeKitStanding(standing, reading)} — ${readAt} — ${repositoryUrl} — project ${projectId}`;
}
