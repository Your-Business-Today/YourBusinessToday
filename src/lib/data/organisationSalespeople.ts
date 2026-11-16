import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

/**
 * The people an organisation's Sales names: everyone on the organisation, and anyone on the staff who
 * brought in one of its records without being on it, so no record loses the name of who brought it in.
 */
export function salespeopleOf(members: StaffMember[], staffMembers: StaffMember[], ownerIds: (string | null)[]): StaffMember[] {
	const memberIds = new Set(members.map(({ id }) => id));
	const outsideOwners = staffMembers.filter(({ id }) => ownerIds.includes(id) && !memberIds.has(id));
	return [...members, ...outsideOwners];
}
