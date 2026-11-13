import { isUuid } from '$lib/data/isUuid';
import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

export const broughtInByRefusal = 'Brought in by must name someone on the staff.';

/** The staff member an account id names, or null when it names nobody on the staff and is refused. */
export function staffMemberWithId(staffMembers: StaffMember[], accountId: string): StaffMember | null {
	if (!isUuid(accountId)) return null;
	return staffMembers.find((member) => member.id === accountId) ?? null;
}

/** Who brought a record in, by name, or nothing when they are not on the staff. */
export function broughtInByName(staffMembers: StaffMember[], ownerId: string | null): string {
	const owner = staffMembers.find((member) => member.id === ownerId);
	return owner?.name ?? '';
}
