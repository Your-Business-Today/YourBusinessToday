const isoDate = /^\d{4}-\d{2}-\d{2}$/;

/** Why a signer's name or position cannot be kept, naming the field and its limit; null when it can. */
export function textRefusal(field: string, value: string, longest: number): string | null {
	const isWithinLimits = value !== '' && value.length <= longest;
	if (isWithinLimits) return null;
	return `${field} is 1 to ${longest} characters.`;
}

/** Why the day a signer signs cannot be kept; null when it is a real day. */
export function dateRefusal(signedOn: string): string | null {
	const day = new Date(`${signedOn}T00:00:00Z`);
	const isDay = isoDate.test(signedOn) && !Number.isNaN(day.getTime());
	if (isDay) return null;
	return 'The date you sign is a day, such as 2026-11-25.';
}
