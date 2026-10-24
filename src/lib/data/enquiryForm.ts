export type WebsiteEnquiry = {
	name: string;
	email: string;
	phone: string;
	company: string;
	website: string;
	whenSuits: string;
	message: string;
};

/** The longest each value may be: the booking form shows the limits and the server refuses anything longer. */
export const enquiryFieldLimits: Record<keyof WebsiteEnquiry, number> = {
	name: 120,
	email: 254,
	phone: 40,
	company: 120,
	website: 200,
	whenSuits: 200,
	message: 2000
};

export const enquiryHoneypotField = 'nickname';
