import { describe, expect, it } from 'vitest';
import { readWebsiteEnquiry } from './websiteEnquiry';
import type { WebsiteEnquiry } from '$lib/data/enquiryForm';

const completeRequest: WebsiteEnquiry = {
	name: 'Ada',
	email: 'ada@example.com',
	phone: '020 7000 0000',
	company: '',
	website: '',
	whenSuits: 'Tuesday afternoons',
	message: 'Our quotes'
};

function enquiryForm(fields: Partial<WebsiteEnquiry>): FormData {
	const formData = new FormData();
	for (const [fieldName, value] of Object.entries({ ...completeRequest, ...fields })) {
		formData.set(fieldName, value);
	}
	return formData;
}

describe('readWebsiteEnquiry website', () => {
	it('keeps a blank or public website', () => {
		expect(readWebsiteEnquiry(enquiryForm({ website: '' }))).toHaveProperty('enquiry.website', '');
		expect(readWebsiteEnquiry(enquiryForm({ website: 'https://ada.example' }))).toHaveProperty(
			'enquiry.website',
			'https://ada.example'
		);
	});

	it('refuses a website that is not a public address rather than blanking it', () => {
		const reading = readWebsiteEnquiry(enquiryForm({ website: 'localhost:3000' }));
		expect(reading).toEqual({ problem: 'The website must be a public web address, such as https://example.com.' });
	});
});

describe('readWebsiteEnquiry phone', () => {
	it('keeps a phone number written the usual ways', () => {
		expect(readWebsiteEnquiry(enquiryForm({ phone: '+44 (0)20 7000 0000' }))).toHaveProperty(
			'enquiry.phone',
			'+44 (0)20 7000 0000'
		);
		expect(readWebsiteEnquiry(enquiryForm({ phone: '07700-900-123' }))).toHaveProperty('enquiry.phone', '07700-900-123');
	});

	it('refuses a missing or short phone number, since the call needs one', () => {
		const problem = { problem: 'Enter a phone number we can call you on.' };
		expect(readWebsiteEnquiry(enquiryForm({ phone: '' }))).toEqual(problem);
		expect(readWebsiteEnquiry(enquiryForm({ phone: '12345' }))).toEqual(problem);
		expect(readWebsiteEnquiry(enquiryForm({ phone: 'call me' }))).toEqual(problem);
	});

	it('keeps when suits them, and leaves it blank when they said nothing', () => {
		expect(readWebsiteEnquiry(enquiryForm({}))).toHaveProperty('enquiry.whenSuits', 'Tuesday afternoons');
		expect(readWebsiteEnquiry(enquiryForm({ whenSuits: '' }))).toHaveProperty('enquiry.whenSuits', '');
	});
});
