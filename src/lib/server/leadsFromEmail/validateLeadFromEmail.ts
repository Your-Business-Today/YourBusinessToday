import { isOurAddress } from '$lib/data/emailDomains';
import { normaliseCompanyNumber, validateCompanyNumber } from '$lib/data/prospectRules';
import { trimmedText } from '$lib/data/trimmedText';
import { validateEmailDetails } from '$lib/server/filedEmails/validateFiledEmail';
import { noCompanyNumber, type LeadEnquiry, type NewLead } from './leadFromEmail';

const receivedDirection = 'received';

export const leadFromEmailRefusals = {
	privateIndividualNotYesOrNo: 'isPrivateIndividual is true or false.',
	senderNameRequired: 'senderName is the name the sender signs with, as the email gives it.',
	companyOrPrivate: 'Give companyName, the company the sender writes for, or isPrivateIndividual true when they write for themselves, not both.',
	numberForCompanyOnly: 'A private individual has no company number: leave companyNumber out.',
	fromUs: 'The email is from one of our own addresses, so it is not an enquiry from a new lead.'
} as const;

type Lead = Omit<NewLead, 'broughtInBy'>;

/** The lead as given, every value checked before anything is written, or the sentence naming the one that does not fit. */
export function validateLeadFromEmail(input: Record<string, unknown>): LeadEnquiry | string {
	const email = validateEmailDetails({ ...input, direction: receivedDirection });
	if (typeof email === 'string') return email;
	if (isOurAddress(email.from)) return leadFromEmailRefusals.fromUs;
	const lead = readLead(input);
	if (typeof lead === 'string') return lead;
	return { email, lead: { ...lead, broughtInBy: trimmedText(input.broughtInBy) } };
}

function readLead(input: Record<string, unknown>): Lead | string {
	const isPrivateIndividual = input.isPrivateIndividual ?? false;
	if (typeof isPrivateIndividual !== 'boolean') return leadFromEmailRefusals.privateIndividualNotYesOrNo;
	const senderName = trimmedText(input.senderName);
	if (senderName === '') return leadFromEmailRefusals.senderNameRequired;
	const companyName = trimmedText(input.companyName);
	const isCompanyNamed = companyName !== '';
	if (isCompanyNamed === isPrivateIndividual) return leadFromEmailRefusals.companyOrPrivate;
	const companyNumber = readCompanyNumberFromInput(input, isPrivateIndividual);
	if (companyNumber.refusal !== null) return companyNumber.refusal;
	const leadName = isPrivateIndividual ? senderName : companyName;
	const senderPhone = trimmedText(input.senderPhone);
	return { leadName, isPrivateIndividual, senderName, senderPhone, companyNumber: companyNumber.number };
}

function readCompanyNumberFromInput(input: Record<string, unknown>, isPrivateIndividual: boolean): { number: string; refusal: string | null } {
	const number = normaliseCompanyNumber(trimmedText(input.companyNumber));
	if (number === noCompanyNumber) return { number, refusal: null };
	if (isPrivateIndividual) return { number, refusal: leadFromEmailRefusals.numberForCompanyOnly };
	return { number, refusal: validateCompanyNumber(number) };
}
