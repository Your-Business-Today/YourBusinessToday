import { describe, expect, it } from 'vitest';
import {
	readTeamChoiceFrom,
	teamProjectChosen,
	teamProjectField,
	teamProjectNotChosen,
	validateTeamProjectAnswer
} from './teamProject';

function formAnswering(...answers: string[]): FormData {
	const formData = new FormData();
	for (const answer of answers) formData.append(teamProjectField, answer);
	return formData;
}

describe('readTeamChoiceFrom', () => {
	it('makes no choice when the form offered none', () => {
		expect(readTeamChoiceFrom(formAnswering())).toBeNull();
	});

	it('reads an unticked box as personal', () => {
		expect(readTeamChoiceFrom(formAnswering(teamProjectNotChosen))).toBe(false);
	});

	it('reads a ticked box as a team project', () => {
		expect(readTeamChoiceFrom(formAnswering(teamProjectNotChosen, teamProjectChosen))).toBe(true);
	});
});

describe('validateTeamProjectAnswer', () => {
	it('takes true and false as they are', () => {
		expect(validateTeamProjectAnswer(true)).toBe(true);
		expect(validateTeamProjectAnswer(false)).toBe(false);
	});

	it('refuses anything that is not true or false', () => {
		expect(validateTeamProjectAnswer('yes')).toBeNull();
	});
});
