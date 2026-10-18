import { describe, expect, it } from 'vitest';
import { readWebsiteEnquiry } from './websiteEnquiry';

function enquiryForm(website: string): FormData {
	const formData = new FormData();
	formData.set('name', 'Ada');
	formData.set('email', 'ada@example.com');
	formData.set('message', 'Our quotes');
	formData.set('website', website);
	return formData;
}

describe('readWebsiteEnquiry website', () => {
	it('keeps a blank or public website', () => {
		expect(readWebsiteEnquiry(enquiryForm(''))).toHaveProperty('enquiry.website', '');
		expect(readWebsiteEnquiry(enquiryForm('https://ada.example'))).toHaveProperty('enquiry.website', 'https://ada.example');
	});

	it('refuses a website that is not a public address rather than blanking it', () => {
		const reading = readWebsiteEnquiry(enquiryForm('localhost:3000'));
		expect(reading).toEqual({ problem: 'The website must be a public web address, such as https://example.com.' });
	});
});
