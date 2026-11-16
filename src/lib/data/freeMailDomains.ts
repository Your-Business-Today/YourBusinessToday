/** Mail services anyone can sign up to: an address at one says nothing about the company its sender works for. */
export const freeMailDomains = [
	'gmail.com',
	'googlemail.com',
	'outlook.com',
	'hotmail.com',
	'hotmail.co.uk',
	'live.com',
	'live.co.uk',
	'msn.com',
	'yahoo.com',
	'yahoo.co.uk',
	'ymail.com',
	'icloud.com',
	'me.com',
	'mac.com',
	'aol.com',
	'aol.co.uk',
	'btinternet.com',
	'sky.com',
	'virginmedia.com',
	'talktalk.net',
	'protonmail.com',
	'proton.me',
	'gmx.com',
	'gmx.co.uk',
	'mail.com',
	'zoho.com'
];

export function isFreeMailDomain(domain: string): boolean {
	return freeMailDomains.includes(domain);
}
