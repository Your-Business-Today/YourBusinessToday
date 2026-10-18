import { describe, expect, it } from 'vitest';
import { validateTextColumn } from './textColumnRules';

describe('validateTextColumn', () => {
	it('accepts any text, the empty string included', () => {
		expect(validateTextColumn('client_name', 'A client')).toBeNull();
		expect(validateTextColumn('client_name', '')).toBeNull();
		expect(validateTextColumn('client_name', 'x'.repeat(5000))).toBeNull();
	});

	it('refuses a value that is not text, naming the field', () => {
		expect(validateTextColumn('client_name', 42)).toBe('The client_name is text.');
		expect(validateTextColumn('client_name', { name: 'x' })).toBe('The client_name is text.');
	});

	it('refuses the NUL character a text column cannot hold', () => {
		expect(validateTextColumn('redirect_uri', 'https://a.example/\u0000')).toBe(
			'The redirect_uri cannot contain a NUL character.'
		);
	});
});
