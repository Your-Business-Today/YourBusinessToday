import { describe, expect, it, vi } from 'vitest';
import { actionsFor } from './actionRegistry';
import { ybtCommands, ybtCommandsDoctrine } from './ybtCommands';
import { meetingCommand } from './ybtMeetingCommand';
import type { AccountStanding } from './resolveAccountStanding';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const aStaffMember = { isAdmin: false, isStaff: true } as AccountStanding;
const actionName = /\b[a-z]+(?:_[a-z]+)+\b/g;

const readyingAndFilingTheMeeting = [
	'list_clients',
	'read_client',
	'open_lead_organisation',
	'read_business_brain_domain',
	'read_workflow_map',
	'read_map_products',
	'read_people_in_the_loop',
	'read_lead_quote',
	'file_business_brain_domain',
	'amend_workflow_map',
	'file_lead_quote',
	'log_lead_conversation'
];

describe('/ybt-meeting', () => {
	const { text } = meetingCommand;

	it('names the actions of readying for a meeting and filing it in the order they are used, and no other', () => {
		expect(text.match(actionName)).toEqual(readyingAndFilingTheMeeting);
	});

	it('names only actions a staff member is offered', () => {
		const offeredNames = actionsFor(aStaffMember, null).map((action) => action.name);
		expect(readyingAndFilingTheMeeting.filter((name) => !offeredNames.includes(name))).toEqual([]);
	});

	it('files what the person relays at once, and the figures only from them or the rates sheet', () => {
		expect(text).toContain('file it as said, at once');
		expect(text).toContain('its figures only from me or the rates sheet, never from you');
	});

	it('sends nothing to the lead and keeps contact details out of the map', () => {
		expect(text).toContain('Nothing is sent to the lead, and no email address or phone number goes into the map.');
	});

	it('is offered as a prompt and named in the current context', () => {
		expect(ybtCommands).toContain(meetingCommand);
		expect(ybtCommandsDoctrine).toContain('/ybt-meeting');
	});
});
