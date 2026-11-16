import type { EmailDetails } from '$lib/data/filedEmailRules';
import type { EmailOwner } from '$lib/server/filedEmails/emailOwner';

/** A new lead as a Claude reads it from an email it received: who wrote and for which company. */
export type NewLead = {
	leadName: string;
	isPrivateIndividual: boolean;
	senderName: string;
	senderPhone: string;
	companyNumber: string;
	broughtInBy: string;
};

/** An enquiry we received: the lead it makes and the email to file under it. */
export type LeadEnquiry = { lead: NewLead; email: EmailDetails };

/** Where the new lead was written: the client, the person who wrote and the email filed under it. */
export type LeadFromEmailOutcome = { clientId: string; personId: string; filedEmailId: string };

/** What already holds the sender or their company, so nothing is added twice. */
export type HeldAlready =
	| { kind: 'sender'; owner: EmailOwner }
	| { kind: 'company'; clientId: string };

export const heldAlreadyKinds = { sender: 'sender', company: 'company' } as const;

export const noCompanyNumber = '';
