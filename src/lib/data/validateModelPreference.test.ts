import { describe, expect, it } from 'vitest';
import { modelLadder } from './modelLadder';
import { modelPreferenceRefusal, validateModelPreference } from './validateModelPreference';

describe('validateModelPreference', () => {
	it('lets through every model the slider offers', () => {
		for (const rung of modelLadder) expect(validateModelPreference(rung.modelId)).toBeNull();
	});

	it('refuses a model the slider does not offer', () => {
		expect(validateModelPreference('gpt-4')).toBe(modelPreferenceRefusal);
		expect(validateModelPreference('')).toBe(modelPreferenceRefusal);
	});
});
