import { describe, expect, it } from 'vitest';
import { screenInTurn, type ScreenTurn } from './screenInTurn';

const companyNumbers = ['00000001', '00000002', '00000003', '00000004'];

/** A screen of four companies whose run is cut off after the number of companies given. */
function turnCutOffAfter(companiesBeforeCutOff: number, resumeAfter: string, screened: string[], marks: string[]): ScreenTurn {
	return {
		companyNumbers,
		resumeAfter,
		companiesDone: companyNumbers.filter((companyNumber) => companyNumber <= resumeAfter).length,
		screenOne: async (companyNumber) => {
			screened.push(companyNumber);
		},
		markDone: async (companyNumber, companiesDone) => {
			marks.push(`${companyNumber}:${companiesDone}`);
		},
		isOutOfTime: () => screened.length >= companiesBeforeCutOff
	};
}

describe('one run of a cash screen', () => {
	it('stops when its time is up, having recorded each company it finished', async () => {
		const screened: string[] = [];
		const marks: string[] = [];
		const result = await screenInTurn(turnCutOffAfter(2, '', screened, marks));
		expect(result).toEqual({ lastDone: '00000002', screenedThisRun: 2, isFinished: false });
		expect(marks).toEqual(['00000001:1', '00000002:2']);
	});

	it('resumes after the company it last finished, and finishes the screen', async () => {
		const screened: string[] = [];
		const marks: string[] = [];
		const result = await screenInTurn(turnCutOffAfter(10, '00000002', screened, marks));
		expect(screened).toEqual(['00000003', '00000004']);
		expect(marks).toEqual(['00000003:3', '00000004:4']);
		expect(result.isFinished).toBe(true);
	});
});
