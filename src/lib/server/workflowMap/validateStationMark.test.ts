import { describe, expect, it } from 'vitest';
import { stationReviewLimits } from '$lib/data/workflowMap/stationReviewLimits';
import { validateStationMark, validateStationMarkForm } from './validateStationMark';

const rightMark = { stage: 'after', versionNumber: '3', stationKey: 'work-order-award', reviewState: 'right' };

describe('a client mark on a station, checked against its columns', () => {
	it('takes a station marked right', () => {
		expect(validateStationMark(rightMark)).toEqual({ ...rightMark, versionNumber: 3, whatIsWrong: null });
	});

	it('takes a station marked not right with what is wrong, from the portal form too', () => {
		const form = new FormData();
		const values = { ...rightMark, reviewState: 'not_right', whatIsWrong: ' The QS awards it, not the director. ' };
		for (const [field, value] of Object.entries(values)) form.set(field, value);
		expect(validateStationMarkForm(form)).toMatchObject({ reviewState: 'not_right', whatIsWrong: 'The QS awards it, not the director.' });
	});

	it('refuses not right without what is wrong, and what is wrong without not right', () => {
		expect(validateStationMark({ ...rightMark, reviewState: 'not_right' })).toEqual({ refusal: 'Say what is wrong, so your Claude can put it right.' });
		expect(validateStationMark({ ...rightMark, whatIsWrong: 'Something' })).toHaveProperty('refusal');
	});

	it('refuses what is wrong over its column, never cutting it', () => {
		const tooLong = 'x'.repeat(stationReviewLimits.whatIsWrongLength + 1);
		const refusal = validateStationMark({ ...rightMark, reviewState: 'not_right', whatIsWrong: tooLong });
		expect(refusal).toEqual({ refusal: `What is wrong is too long: keep it to ${stationReviewLimits.whatIsWrongLength} characters.` });
	});

	it('refuses an unknown map, a version that is not a whole number, a misshapen key and an unknown mark', () => {
		expect(validateStationMark({ ...rightMark, stage: 'during' })).toEqual({ refusal: 'The map must be one of: before, after.' });
		expect(validateStationMark({ ...rightMark, versionNumber: '2.5' })).toHaveProperty('refusal');
		expect(validateStationMark({ ...rightMark, versionNumber: '0' })).toHaveProperty('refusal');
		expect(validateStationMark({ ...rightMark, stationKey: 'Work Order' })).toHaveProperty('refusal');
		expect(validateStationMark({ ...rightMark, reviewState: 'not_checked' })).toEqual({ refusal: 'The mark must be one of: right, not_right.' });
	});

	it('refuses an email address in what is wrong', () => {
		const withAddress = { ...rightMark, reviewState: 'not_right', whatIsWrong: 'Ask dana@acme.example' };
		expect(validateStationMark(withAddress)).toHaveProperty('refusal');
	});
});
