import { isEmailShaped } from '$lib/data/emailShape';
import { filedEmailLimits } from '$lib/data/filedEmailRules';

const { longestAddress, longestGmailId } = filedEmailLimits;
const whiteSpace = /\s/;

/** Whether the text fits a mailbox or address column: an address alone, no longer than the column takes. */
export function isMailboxAddress(text: string): boolean {
	return text.length <= longestAddress && isEmailShaped(text);
}

/** Whether the text fits a Gmail message or thread id column: present, no spaces, no longer than the column takes. */
export function isGmailId(text: string): boolean {
	return text !== '' && text.length <= longestGmailId && !whiteSpace.test(text);
}
