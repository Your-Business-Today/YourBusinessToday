import { describe, expect, it, vi } from 'vitest';
import { actionsFor } from './actionRegistry';
import { emailSenders, isLabelledAsSendingEmail, isSentFromTheirClaude, sendsEmailFrom } from './sendsEmail';
import { workingDoctrine } from './workingDoctrine';
import { readActionDefinitions, type ActionDefinition } from '$lib/tests/emailSendingReach/actionDefinitions';
import { emailSendingDeclarations } from '$lib/tests/emailSendingReach/emailSendingDeclarations';
import { SymbolReach } from '$lib/tests/emailSendingReach/symbolReach';
import type { AccountStanding } from './resolveAccountStanding';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const anAdministrator = { isAdmin: true, isStaff: true } as AccountStanding;
const emailSender = { fromPath: 'src/lib/server/email/sendTransactionalEmail.ts', name: 'sendTransactionalEmail' };
const everyAction = actionsFor(anAdministrator, null);
const definitions = readActionDefinitions(new Set(everyAction.map((action) => action.name)));

function trailToTheSender(definition: ActionDefinition): string | null {
	const reach = new SymbolReach(emailSender);
	if (!reach.fromNode(definition.code, definition.sourceModule)) return null;
	return `${definition.name}: ${reach.trail.join(' → ')}`;
}

const trails = definitions.map(trailToTheSender).filter((trail): trail is string => trail !== null);
const sendingNames = new Set(trails.map((trail) => trail.slice(0, trail.indexOf(':'))));
const isDeclared = (name: string) => Object.hasOwn(emailSendingDeclarations, name);
const sendsFromTheirOwnClaude = new Set(
	everyAction.filter((action) => isSentFromTheirClaude(action.summary)).map((action) => action.name)
);

describe('every connector action that sends an email says so before it is run', () => {
	it('finds where every offered action is written, so none is left unread', () => {
		const found = new Set(definitions.map((definition) => definition.name));
		expect(everyAction.filter((action) => !found.has(action.name)).map((action) => action.name)).toEqual([]);
	});

	it('finds the senders it knows of, so a broken reading cannot pass by finding none', () => {
		expect([...sendingNames]).toEqual(expect.arrayContaining(['send_invoice', 'invite_to_project', 'send_password_reset']));
	});

	it('opens the description of every action that reaches the sender with SENDS EMAIL, unless it is declared', () => {
		const unlabelled = everyAction.filter((action) => sendingNames.has(action.name) && !isDeclared(action.name));
		const unlabelledTrails = unlabelled.filter((action) => !isLabelledAsSendingEmail(action.summary));
		expect(unlabelledTrails.map((action) => trails.find((trail) => trail.startsWith(`${action.name}:`)))).toEqual([]);
	});

	it('labels no action that cannot send, and declares none that does not reach the sender', () => {
		const labelledNames = everyAction.filter((action) => isLabelledAsSendingEmail(action.summary)).map((action) => action.name);
		const labelledButNotSending = labelledNames.filter((name) => !sendingNames.has(name) && !sendsFromTheirOwnClaude.has(name));
		expect(labelledButNotSending.filter((name) => !isDeclared(name))).toEqual([]);
		expect(labelledNames.filter(isDeclared)).toEqual([]);
		expect(Object.keys(emailSendingDeclarations).filter((name) => !sendingNames.has(name))).toEqual([]);
	});

	it('labels the email a Claude sends from the consulting inbox through Gmail, which no code of ours sends', () => {
		const preparing = everyAction.find((action) => action.name === 'prepare_email');
		expect(preparing?.summary.startsWith(sendsEmailFrom(emailSenders.consultingThroughGmail, ''))).toBe(true);
		expect([...sendsFromTheirOwnClaude].filter((name) => sendingNames.has(name))).toEqual([]);
	});

	it('tells every Claude to run a SENDS EMAIL action only on the person’s yes, with the email shown first', () => {
		expect(workingDoctrine).toContain('"SENDS EMAIL from <sender>:"');
		expect(workingDoctrine).toContain('yes');
		expect(workingDoctrine).toContain('who it goes to and what it says');
	});
});
