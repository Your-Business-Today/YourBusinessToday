export const emailAddressLimits = { mostAddresses: 20, longestAddress: 254 } as const;

const plainEmailAddress = /^[a-z0-9._%+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

export type EmailAddressList = { addresses: string[] } | { refusal: string };

/** The addresses of one email, trimmed, in lower case and each once, or why they cannot be read as that. */
export function readEmailAddressList(fieldName: string, value: unknown): EmailAddressList {
	if (!Array.isArray(value) || value.length === 0) return { refusal: `${fieldName} must be a list of at least one email address.` };
	if (value.length > emailAddressLimits.mostAddresses) return { refusal: tooManyAddresses(fieldName, value.length) };
	const addresses = value.map((address) => String(address).trim().toLowerCase());
	const unfit = addresses.find((address) => validateOneAddress(address) !== null);
	if (unfit !== undefined) return { refusal: `${fieldName}: ${validateOneAddress(unfit)}` };
	return { addresses: [...new Set(addresses)] };
}

/** Why the address cannot be looked up, or null when it is a plain email address of a length one can hold. */
export function validateOneAddress(address: string): string | null {
	if (address.length > emailAddressLimits.longestAddress) {
		return `"${address.slice(0, 40)}…" is longer than an email address can be, ${emailAddressLimits.longestAddress} characters.`;
	}
	if (plainEmailAddress.test(address)) return null;
	return `"${address}" is not an email address, such as name@example.com.`;
}

function tooManyAddresses(fieldName: string, count: number): string {
	return `${fieldName} holds ${count} addresses; give at most ${emailAddressLimits.mostAddresses}, the from, to and cc of one email.`;
}
