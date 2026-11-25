import { bracketedBlanks, type ContractPack } from '$lib/data/contractPack';
import type { ContractPackStage } from '$lib/data/contractPackRules';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';

const stagesPastSending: ContractPackStage[] = ['signed_by_client', 'countersigned'];

/** Why the pack itself cannot be sent: the client has signed it already, or a document still has a blank in its brackets. */
export function packSendingRefusal(pack: ContractPack): string | null {
	const isPastSending = stagesPastSending.includes(pack.stage);
	if (isPastSending) return 'The client has signed this pack already, so there is nothing to send.';
	const unfinished = pack.documents.filter(({ openBlanks }) => openBlanks.length > 0);
	if (unfinished.length === 0) return null;
	const named = unfinished.map((document) => `${document.title} (${bracketedBlanks(document.openBlanks)})`).join('; ');
	return `These documents still have blanks to fill before the client can sign them: ${named}. Prepare the pack again with the values.`;
}

/** Why the contact chosen cannot be sent the pack: no email, or no portal sign-in to read it with. */
export function recipientRefusal(contact: ClientContact): string | null {
	const hasNoEmail = contact.email === '';
	if (hasNoEmail) return `${contact.name} has no email address on the register, so there is nowhere to send the pack.`;
	const hasNoSignIn = contact.accountId === null;
	if (hasNoSignIn) return `${contact.name} has no portal sign-in yet, so the link would not open for them. Invite them first (invite_client_contact).`;
	return null;
}
