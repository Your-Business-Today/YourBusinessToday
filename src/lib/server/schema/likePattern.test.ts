import { describe, expect, it } from 'vitest';
import { literalInLike } from './likePattern';

describe('a word made safe to put inside a like pattern', () => {
	it('leaves a plain word as it is', () => {
		expect(literalInLike('accountant')).toBe('accountant');
	});

	it('makes an underscore and a percent sign plain characters, so neither stands for anything else', () => {
		expect(literalInLike('hair_salon')).toBe('hair\\_salon');
		expect(literalInLike('100%')).toBe('100\\%');
	});

	it('makes a backslash plain as well, so it cannot undo the others', () => {
		expect(literalInLike('a\\_b')).toBe('a\\\\\\_b');
	});
});
