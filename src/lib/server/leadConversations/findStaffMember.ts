import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

/** The one staff member a name points to: their whole name, or their first name when only one has it; null when none or several do. */
export function findStaffMember(staffMembers: StaffMember[], givenName: string): StaffMember | null {
	const wanted = givenName.trim().toLowerCase();
	const byWholeName = staffMembers.filter((member) => member.name.toLowerCase() === wanted);
	if (byWholeName.length === 1) return byWholeName[0];
	const byFirstName = staffMembers.filter((member) => firstNameOf(member) === wanted);
	if (byFirstName.length === 1) return byFirstName[0];
	return null;
}

function firstNameOf(member: StaffMember): string {
	const [firstName] = member.name.toLowerCase().split(/\s+/);
	return firstName;
}
