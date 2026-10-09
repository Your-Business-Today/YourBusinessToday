import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './createClient';
import { getClient } from './getClient';
import { recordClientEvent } from './recordClientEvent';

export type GroupChoice = { existingParentId: string } | { newParentName: string };

export function readGroupChoice(formData: FormData): GroupChoice | null {
	const existingParentId = String(formData.get('parentClientId') ?? '').trim();
	if (existingParentId !== '') return { existingParentId };
	const newParentName = String(formData.get('newParentName') ?? '').trim();
	if (newParentName === '') return null;
	return { newParentName };
}

export async function groupClientsUnder(
	supabase: SupabaseClient,
	clientIds: string[],
	choice: GroupChoice,
	actorAccountId: string
): Promise<string> {
	const parentId = await resolveParent(supabase, choice, actorAccountId);
	const parent = await getClient(supabase, parentId);
	if (parent === null) throw new Error('The group could not be found');
	const ancestors = await ancestorsOf(supabase, parentId);
	const children = clientIds.filter(
		(clientId) => clientId !== parentId && !ancestors.includes(clientId)
	);
	const { error } = await supabase
		.from('clients')
		.update({ parent_client_id: parentId })
		.in('id', children);
	if (error) throw error;
	for (const clientId of children) {
		await recordClientEvent(supabase, clientId, 'grouped_under', { group: parent.name }, actorAccountId);
	}
	return parentId;
}

/**
 * A company cannot be put under one of its own descendants, or the group
 * would point at itself for ever.
 */
async function ancestorsOf(supabase: SupabaseClient, clientId: string): Promise<string[]> {
	const ancestors: string[] = [];
	let currentId: string | null = clientId;
	while (currentId !== null && !ancestors.includes(currentId)) {
		ancestors.push(currentId);
		const parent: { id: string; parentClientId: string | null } | null = await getClient(
			supabase,
			currentId
		);
		currentId = parent === null ? null : parent.parentClientId;
	}
	return ancestors;
}

async function resolveParent(
	supabase: SupabaseClient,
	choice: GroupChoice,
	actorAccountId: string
): Promise<string> {
	if ('existingParentId' in choice) return choice.existingParentId;
	return createClient(
		supabase,
		{ name: choice.newParentName, website: '', ownerId: actorAccountId, source: 'staff' },
		actorAccountId
	);
}
