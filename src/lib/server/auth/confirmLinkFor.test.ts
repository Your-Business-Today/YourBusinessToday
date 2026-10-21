import { describe, expect, it } from 'vitest';
import { confirmLinkFor } from './confirmLinkFor';

const origin = 'https://www.yourbusiness.today';
const token = { hashed_token: 'abc123', verification_type: 'signup' };

describe('confirmLinkFor', () => {
	it('points at the site confirm page with the token, its type and the destination', () => {
		const link = new URL(confirmLinkFor(origin, token, '/projects'));
		expect(link.pathname).toBe('/auth/confirm');
		expect(link.searchParams.get('token_hash')).toBe('abc123');
		expect(link.searchParams.get('type')).toBe('signup');
		expect(link.searchParams.get('next')).toBe('/projects');
	});

	it('sends an off-site destination to the front page', () => {
		const link = new URL(confirmLinkFor(origin, token, 'https://elsewhere.example'));
		expect(link.searchParams.get('next')).toBe('/');
	});
});
