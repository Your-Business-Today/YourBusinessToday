import { describe, expect, it } from 'vitest';
import { parsePublicUrl, publicUrlOr, validatePublicUrl } from './parsePublicUrl';

describe('parsePublicUrl schemes and ports', () => {
	it('accepts http and https on default ports', () => {
		expect(parsePublicUrl('https://example.com/page')?.href).toBe('https://example.com/page');
		expect(parsePublicUrl('http://example.com:80/')?.hostname).toBe('example.com');
		expect(parsePublicUrl('https://example.com:443/')?.hostname).toBe('example.com');
	});

	it('refuses other schemes and unparsable text', () => {
		expect(parsePublicUrl('ftp://example.com/file')).toBeNull();
		expect(parsePublicUrl('file:///etc/passwd')).toBeNull();
		expect(parsePublicUrl('javascript:alert(1)')).toBeNull();
		expect(parsePublicUrl('not a url')).toBeNull();
	});

	it('refuses non-default ports', () => {
		expect(parsePublicUrl('https://example.com:8443/')).toBeNull();
		expect(parsePublicUrl('http://example.com:3000/')).toBeNull();
	});
});

describe('parsePublicUrl private hosts', () => {
	it.each([
		'http://localhost/',
		'http://localhost.example/',
		'http://127.0.0.1/',
		'http://10.1.2.3/',
		'http://192.168.1.1/',
		'http://172.16.0.1/',
		'http://172.31.255.255/',
		'http://169.254.169.254/',
		'http://100.64.0.1/',
		'http://100.127.255.255/',
		'http://0.0.0.0/',
		'http://[::1]/',
		'http://service.internal/',
		'http://printer.local/'
	])('refuses %s', (candidate) => {
		expect(parsePublicUrl(candidate)).toBeNull();
	});

	it.each(['http://172.15.0.1/', 'http://172.32.0.1/', 'http://100.63.0.1/', 'http://100.128.0.1/'])(
		'accepts the public neighbour %s',
		(candidate) => {
			expect(parsePublicUrl(candidate)).not.toBeNull();
		}
	);
});

describe('publicUrlOr', () => {
	it('returns the normalised href of an acceptable URL', () => {
		expect(publicUrlOr('  https://example.com  ', 'fallback')).toBe('https://example.com/');
	});

	it('falls back for private, absent or unparsable candidates', () => {
		expect(publicUrlOr('http://10.0.0.1/', 'fallback')).toBe('fallback');
		expect(publicUrlOr(undefined, 'fallback')).toBe('fallback');
		expect(publicUrlOr('nonsense', 'fallback')).toBe('fallback');
	});
});

describe('validatePublicUrl', () => {
	it('lets a blank or public address through', () => {
		expect(validatePublicUrl('website', '')).toBeNull();
		expect(validatePublicUrl('website', null)).toBeNull();
		expect(validatePublicUrl('website', ' https://example.com ')).toBeNull();
	});

	it('refuses a private or unparsable address by name rather than blanking it', () => {
		const refusal = 'The website must be a public web address, such as https://example.com.';
		expect(validatePublicUrl('website', 'http://10.0.0.1/')).toBe(refusal);
		expect(validatePublicUrl('website', 'nonsense')).toBe(refusal);
	});
});
