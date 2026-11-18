/** Every account made before the promotional video went out is let in as it was. */
export const admissionCutOff = new Date('2026-11-17T22:00:00Z');

/** What decides whether a signed-in account is let past the contact page. */
export type AdmissionFacts = {
	wasMadeBeforeCutOff: boolean;
	isStaff: boolean;
	isOnAnOrganisation: boolean;
	wasAddedToAProject: boolean;
	isClientContact: boolean;
};

export function wasMadeBeforeCutOff(
	createdAt: string | null | undefined,
): boolean {
	if (createdAt === null || createdAt === undefined) return false;
	return new Date(createdAt) < admissionCutOff;
}

/** An account is let in when it was here before the cut-off or someone at Your Business Today has brought it onto something. */
export function isAdmittedBy(facts: AdmissionFacts): boolean {
	return (
		facts.wasMadeBeforeCutOff ||
		facts.isStaff ||
		facts.isOnAnOrganisation ||
		facts.wasAddedToAProject ||
		facts.isClientContact
	);
}
