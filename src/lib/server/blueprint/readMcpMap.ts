import { mcpMapSources } from '$lib/data/blueprint/mcpMapSources';
import { parseParityAudit } from './parseParityAudit';
import { readAgentGuide } from './readAgentGuide';
import { readRepositoryFile, repositoryFileKinds } from '$lib/server/kit/readRepositoryFile';
import { listFolderInRepository, type FolderEntry } from '$lib/server/kit/listFolderInRepository';
import type { AgentGuide, McpMap } from '$lib/data/blueprint/mcpMap';

type Repository = { url: string; ref: string };

const markdownFile = /\.md$/;

/** The stories and their doors from the parity audit, and every skill and agent; null when the repository has none. */
export async function readMcpMap(repositoryUrl: string, ref: string): Promise<McpMap | null> {
	const repository = { url: repositoryUrl, ref };
	const stories = parseParityAudit(await readText(repository, mcpMapSources.parityAuditPath));
	const skills = [...(await readClaudeSkills(repository)), ...(await readMarkdownGuides(repository, mcpMapSources.houseSkillsFolder))];
	const agents = await readMarkdownGuides(repository, mcpMapSources.agentsFolder);
	const isEmpty = stories.length === 0 && skills.length === 0 && agents.length === 0;
	return isEmpty ? null : { stories, skills, agents };
}

async function readText(repository: Repository, path: string): Promise<string> {
	const file = await readRepositoryFile(repository.url, path, repository.ref);
	return file.kind === repositoryFileKinds.found ? file.text : '';
}

async function readClaudeSkills(repository: Repository): Promise<AgentGuide[]> {
	const entries = await listFolderInRepository(repository.url, mcpMapSources.claudeSkillsFolder, repository.ref);
	const folders = entries.filter((entry) => entry.isFolder);
	return Promise.all(folders.map((folder) => readGuide(repository, `${folder.path}/${mcpMapSources.skillFileName}`, folder.name)));
}

async function readMarkdownGuides(repository: Repository, folderPath: string): Promise<AgentGuide[]> {
	const entries = await listFolderInRepository(repository.url, folderPath, repository.ref);
	const files = entries.filter(isMarkdownFile);
	return Promise.all(files.map((file) => readGuide(repository, file.path, file.name)));
}

function isMarkdownFile(entry: FolderEntry): boolean {
	return !entry.isFolder && markdownFile.test(entry.name);
}

async function readGuide(repository: Repository, path: string, fallbackName: string): Promise<AgentGuide> {
	return readAgentGuide(await readText(repository, path), path, fallbackName);
}
