import {
	enquiryFieldLimits,
	enquiryHoneypotField,
	type WebsiteEnquiry
} from '$lib/data/enquiryForm';
import { publicUrlOr } from '$lib/server/clients/parsePublicUrl';
import { isEmailShaped } from '$lib/data/emailShape';

export type EnquiryReading =
	| { enquiry: WebsiteEnquiry }
	| { isHoneypotFilled: true }
	| { problem: string };

export function readWebsiteEnquiry(formData: FormData): EnquiryReading {
	if (fieldValue(formData, enquiryHoneypotField) !== '') return { isHoneypotFilled: true };
	const enquiry: WebsiteEnquiry = {
		name: fieldValue(formData, 'name'),
		email: fieldValue(formData, 'email').toLowerCase(),
		company: fieldValue(formData, 'company'),
		website: publicUrlOr(fieldValue(formData, 'website'), ''),
		message: fieldValue(formData, 'message')
	};
	const problem = validateWebsiteEnquiry(enquiry);
	if (problem !== null) return { problem };
	return { enquiry };
}

function fieldValue(formData: FormData, fieldName: string): string {
	return String(formData.get(fieldName) ?? '').trim();
}

function validateWebsiteEnquiry(enquiry: WebsiteEnquiry): string | null {
	if (enquiry.name === '') return 'Tell us your name.';
	if (!isEmailShaped(enquiry.email)) return 'Enter an email address we can reply to.';
	if (enquiry.message === '') return 'Tell us what you would like to automate.';
	const overlongField = findOverlongField(enquiry);
	if (overlongField === null) return null;
	return `Keep the ${overlongField} under ${enquiryFieldLimits[overlongField]} characters.`;
}

function findOverlongField(enquiry: WebsiteEnquiry): keyof WebsiteEnquiry | null {
	const fieldNames = Object.keys(enquiryFieldLimits) as (keyof WebsiteEnquiry)[];
	const overlong = fieldNames.find(
		(fieldName) => enquiry[fieldName].length > enquiryFieldLimits[fieldName]
	);
	return overlong ?? null;
}
