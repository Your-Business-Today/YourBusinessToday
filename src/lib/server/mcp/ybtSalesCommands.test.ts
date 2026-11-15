import { describe, expect, it } from 'vitest';
import { prospectingDoctrine } from './prospectingDoctrine';
import { salesCommands } from './ybtSalesCommands';

const prospectTag = 'ybt-prospect';
const followUpsTag = 'ybt-follow-ups';
const actionName = /\b[a-z]+(?:_[a-z]+)+\b/g;

const pathToAFirstApproach = [
	'list_patches',
	'create_patch',
	'pull_patch_companies',
	'geocode_register_postcodes',
	'start_cash_screen',
	'carry_on_cash_screen',
	'read_cash_screen',
	'read_patch_company',
	'add_patch_company_as_lead',
	'import_company_officers',
	'save_company_research',
	'save_person_research',
	'save_person_approach',
	'update_person'
];

const roundOfFollowUps = ['list_follow_ups_due', 'read_person', 'log_lead_conversation', 'update_person'];

function textOf(tag: string): string {
	const command = salesCommands.find((candidate) => candidate.name === tag);
	return command?.text ?? '';
}

describe('/ybt-prospect', () => {
	const text = textOf(prospectTag);
	const doctrine = prospectingDoctrine.join('\n');

	it('names the actions of the path from a territory to a first approach in the order they are used, and no other', () => {
		expect(text.match(actionName)).toEqual(pathToAFirstApproach);
	});

	it('names only actions rule 9 of the doctrine names, which its own test holds to the actions that exist', () => {
		for (const action of pathToAFirstApproach) expect(doctrine, action).toContain(action);
	});

	it('leaves the sending to the staff member', () => {
		expect(text).toContain('I send the approach myself: you never send anything to a lead.');
		expect(doctrine).toContain('The staff member sends the approach themselves');
	});
});

describe('/ybt-follow-ups', () => {
	const text = textOf(followUpsTag);
	const doctrine = prospectingDoctrine.join('\n');

	it('names the actions of a round of follow-ups in the order they are used, and no other', () => {
		expect(text.match(actionName)).toEqual(roundOfFollowUps);
	});

	it('names only actions rule 9 of the doctrine names', () => {
		for (const action of roundOfFollowUps) expect(doctrine, action).toContain(action);
	});

	it('leaves the sending to the staff member', () => {
		expect(text).toContain('I send them myself: you never send anything to a lead.');
	});
});
