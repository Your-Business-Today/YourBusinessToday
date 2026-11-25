/** A countersignature on a pack, as a YBT director gives it: the pack, who they are and the day they sign. */
export type PackCountersignatureGiven = { packId: string; signerName: string; signerPosition: string; signedOn: string };

/** The names of the countersigning form's fields, read by the form and by the door behind it. */
export const packCountersigningFields = {
	packId: 'packId',
	signerName: 'signerName',
	signerPosition: 'signerPosition',
	signedOn: 'signedOn'
} as const;
