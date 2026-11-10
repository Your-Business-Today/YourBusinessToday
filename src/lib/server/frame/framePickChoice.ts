import { isUuid } from '$lib/data/isUuid';
import { withProjectPick, type RememberedPicks } from './rememberedPicks';
import type { FramePickChoice, FramePicks } from '$lib/components/frame/framePicks';
import type { Refusal } from '$lib/server/portal/portalFormReading';

const notYourOrganisation: Refusal = { refusal: 'Choose one of your organisations from the list.' };
const notItsProject: Refusal = { refusal: 'Choose one of the organisation’s projects from the list.' };

/** The pick the side bar sent: an organisation's id, and a project's id or null when only the organisation was picked. */
export function validateFramePickChoice(body: unknown): FramePickChoice | Refusal {
	const { organisationId, projectId } = (body ?? {}) as Record<string, unknown>;
	if (typeof organisationId !== 'string' || !isUuid(organisationId)) return notYourOrganisation;
	if (projectId === null || projectId === undefined) return { organisationId, projectId: null };
	if (typeof projectId !== 'string' || !isUuid(projectId)) return notItsProject;
	return { organisationId, projectId };
}

/** What would be remembered after the pick, so the picks can be read as the side bar will show them. */
export function rememberedWithChoice(remembered: RememberedPicks, choice: FramePickChoice): RememberedPicks {
	const { organisationId, projectId } = choice;
	const projectPicks = remembered.projectIdByOrganisation;
	if (projectId === null) return { organisationId, projectIdByOrganisation: projectPicks };
	return { organisationId, projectIdByOrganisation: withProjectPick(projectPicks, organisationId, projectId) };
}

/** A pick stands only when the picks read back show it: one of the person's organisations, and one of its projects. */
export function refusalOfPick(picks: FramePicks, choice: FramePickChoice): Refusal | null {
	if (picks.pickedOrganisationId !== choice.organisationId) return notYourOrganisation;
	if (choice.projectId === null) return null;
	if (picks.pickedProjectId !== choice.projectId) return notItsProject;
	return null;
}
