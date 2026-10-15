import type { ClientProject } from '$lib/server/clients/getProjectsForClient';
import type { PortalRequest, PortalRequestMessage } from '$lib/portal/portalRequest';

const yourWords = 'You';

export function describePortalProjects(projects: ClientProject[]): string {
	if (projects.length === 0) return 'YBT runs no projects for your organisation yet.';
	return projects.map(portalProjectLine).join('\n');
}

function portalProjectLine(project: ClientProject): string {
	const liveSystem = project.environmentUrl === '' ? '' : `, live at ${project.environmentUrl}`;
	return `- ${project.name}${liveSystem} (project id: ${project.id})`;
}

export function describePortalRequests(projectName: string, requests: PortalRequest[]): string {
	if (requests.length === 0) return `You have raised no requests on ${projectName}.`;
	return requests.map(portalRequestLines).join('\n\n');
}

function portalRequestLines(request: PortalRequest): string {
	const heading = `- ${request.title}: ${request.statusLabel} (task id: ${request.id})`;
	const answer = request.resolution === '' ? [] : [`  Answer: ${request.resolution}`];
	const lastMessage = request.messages.at(-1);
	const latest = lastMessage === undefined ? [] : [`  Last said: ${messageLine(lastMessage)}`];
	return [heading, ...answer, ...latest].join('\n');
}

function messageLine(message: PortalRequestMessage): string {
	const author = message.isFromVisitor ? yourWords : message.authorName;
	return `${author}, ${message.createdAt.slice(0, 10)}: ${message.body}`;
}
