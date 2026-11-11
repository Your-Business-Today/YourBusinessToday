import { canManageOrganisation, notAnOrganisationManager } from '../organisationAccess';
import { getProject } from '$lib/server/projects/getProject';
import { readPartsTiedTo, tieProductBrainParts, untieProductBrainParts } from '$lib/server/businessBrain/productBrainParts';
import { validatePartList } from '$lib/server/businessBrain/validateBusinessBrainChatbotLists';
import { validateRecordId } from '$lib/data/isUuid';
import { trimmedText } from '$lib/data/trimmedText';
import { noPartsToChange, noSuchProductOfOrganisation, productBrainChanged } from './describeProductBrain';
import type { ProductBrainChange } from '$lib/data/productBrainRules';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Ties parts of the organisation's brain to one of its products and unties others, once the caller manages it. */
export async function changeProductBrain(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	if (!canManageOrganisation(caller, organisation)) return notAnOrganisationManager;
	const projectId = trimmedText(input.projectId);
	const idRefusal = validateRecordId('projectId', projectId);
	if (idRefusal !== null) return idRefusal;
	const change = validatePartsChange(input);
	if (typeof change === 'string') return change;
	const { supabase } = caller;
	const project = await getProject(supabase, projectId);
	const isProductOfOrganisation = project !== null && project.organisationId === organisation.id;
	if (!isProductOfOrganisation) return noSuchProductOfOrganisation;
	const tying = { organisationId: organisation.id, projectId, accountId: caller.accountId };
	const tied = await readPartsTiedTo(supabase, tying);
	await tieProductBrainParts(supabase, tying, change.addParts.filter((part) => !tied.includes(part)));
	await untieProductBrainParts(supabase, tying, change.removeParts.filter((part) => tied.includes(part)));
	const nowTied = await readPartsTiedTo(supabase, tying);
	return productBrainChanged({ organisation, project }, nowTied);
}

function validatePartsChange(input: Record<string, unknown>): ProductBrainChange | string {
	const addParts = validatePartList(input, 'addParts');
	if (typeof addParts === 'string') return addParts;
	const removeParts = validatePartList(input, 'removeParts');
	if (typeof removeParts === 'string') return removeParts;
	const changeCount = addParts.length + removeParts.length;
	if (changeCount === 0) return noPartsToChange;
	const bothWays = addParts.find((part) => removeParts.includes(part));
	if (bothWays !== undefined) return `"${bothWays}" is both tied and untied; name it once. Nothing was changed.`;
	return { addParts, removeParts };
}
