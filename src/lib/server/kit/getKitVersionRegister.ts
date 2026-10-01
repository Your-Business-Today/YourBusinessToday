import type { SupabaseClient } from '@supabase/supabase-js';
import { kitStanding, type KitStanding } from '$lib/data/kitVersion';
import { parseProjectRecord, type Project } from '$lib/server/projects/projectRecord';

export type KitVersionEntry = {
	projectId: string;
	projectName: string;
	repositoryUrl: string;
	kitVersion: string;
	kitVersionReadAt: string | null;
	standing: KitStanding;
};

export type KitVersionRegister = {
	latestKitVersion: string;
	entries: KitVersionEntry[];
	projectsWithoutRepository: number;
};

/** Every project an owner has, with the kit version its repository is on — behind first, then in priority order. */
export async function getKitVersionRegister(
	supabase: SupabaseClient,
	ownerId: string,
	latestKitVersion: string
): Promise<KitVersionRegister> {
	const projects = await getOwnedProjectsWithRepositories(supabase, ownerId);
	const entries = projects.withRepository.map((row) => kitVersionEntry(row, latestKitVersion));
	return {
		latestKitVersion,
		entries: [...entries.filter(isBehind), ...entries.filter((entry) => !isBehind(entry))],
		projectsWithoutRepository: projects.withoutRepositoryCount
	};
}

export async function getOwnedProjectsWithRepositories(
	supabase: SupabaseClient,
	ownerId: string
): Promise<{ withRepository: ProjectWithReadTime[]; withoutRepositoryCount: number }> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('owner_id', ownerId)
		.order('priority', { ascending: true });
	if (error) throw error;
	const projects = data.map(readProjectWithReadTime);
	const withRepository = projects.filter((project) => project.repositoryUrl !== '');
	return { withRepository, withoutRepositoryCount: projects.length - withRepository.length };
}

type ProjectWithReadTime = Project & { kitVersionReadAt: string | null };

function readProjectWithReadTime(row: Record<string, unknown>): ProjectWithReadTime {
	const project = parseProjectRecord(row);
	return { ...project, kitVersionReadAt: (row.kit_version_read_at as string) ?? null };
}

function kitVersionEntry(project: ProjectWithReadTime, latestKitVersion: string): KitVersionEntry {
	const reading = { hasRepository: true, kitVersion: project.kitVersion, latestKitVersion };
	return {
		projectId: project.id,
		projectName: project.name,
		repositoryUrl: project.repositoryUrl,
		kitVersion: project.kitVersion,
		kitVersionReadAt: project.kitVersionReadAt,
		standing: kitStanding(reading)
	};
}

function isBehind(entry: KitVersionEntry): boolean {
	return entry.standing === 'behind';
}
