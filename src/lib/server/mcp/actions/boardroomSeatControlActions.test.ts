import { beforeEach, describe, expect, it, vi } from 'vitest';
import { boardroomSeatControlActions } from './boardroomSeatControlActions';
import { notADirector } from '../boardroomGate';
import { seatControlRefusals } from '$lib/data/boardroomSeatControlRules';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';
import type { McpCaller } from '../resolveMcpCaller';

const heldId = '77777777-7777-4777-8777-777777777777';
const ybt = { id: 'ybt', name: 'Your Business Today' };

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const { board, steering, changing, answering } = vi.hoisted(() => ({
	board: { switchedOn: [] as string[], directors: [] as BoardroomDirector[] },
	steering: vi.fn(),
	changing: vi.fn(),
	answering: vi.fn()
}));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === 'ybt' ? ybt : null)
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => board.switchedOn }));
vi.mock('$lib/server/boardroom/getDirectorsOfOrganisation', () => ({ getDirectorsOfOrganisation: async () => board.directors }));
vi.mock('$lib/server/boardroom/steerOwnClaude', () => ({ steerOwnClaude: steering, changeOwnClaudeSetting: changing }));
vi.mock('$lib/server/boardroom/answerHeldContribution', () => ({ answerHeldContribution: answering }));

const jeremy = { accountId: 'jeremy', isStaff: false, organisationMemberships: [{ organisationId: 'ybt', accountId: 'jeremy', isManager: false }] } as McpCaller;
const james = { accountId: 'james', isStaff: true, organisationMemberships: [] } as unknown as McpCaller;
const jeremysSeat: BoardroomDirector = { id: 'seat', organisationId: 'ybt', accountId: 'jeremy', name: 'Jeremy', namedAt: '2026-11-10T12:00:00.000Z', stoodDownAt: null };
const onMeeting = { organisationId: 'ybt', meetingId: 'meeting-1' };

function run(name: string, caller: McpCaller, input: Record<string, unknown>) {
	const action = boardroomSeatControlActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(caller, { ...onMeeting, ...input });
}

describe("a director's controls over their own Claude, through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		board.switchedOn = ['boardroom'];
		board.directors = [jeremysSeat];
		steering.mockResolvedValue({ answer: 'Your note is kept.', isKept: true });
		changing.mockResolvedValue({ answer: 'Your Claude is paused.', isKept: true });
		answering.mockResolvedValue({ answer: 'Said in the room.', isKept: true });
	});

	it('keeps the steer note as the director gave it', async () => {
		expect(await run('steer_own_claude', jeremy, { words: ' Hold the line on price. ' })).toBe('Your note is kept.');
		expect(steering).toHaveBeenCalledWith(jeremy.supabase, ybt, 'meeting-1', 'Hold the line on price.', expect.objectContaining({ accountId: 'jeremy' }));
		expect(await run('steer_own_claude', jeremy, { words: '' })).toBe(seatControlRefusals.steerNoteMissing);
	});

	it('changes a setting, and answers a held piece, as the director says', async () => {
		expect(await run('change_own_claude_setting', jeremy, { setting: 'paused', isOn: true })).toBe('Your Claude is paused.');
		expect(changing).toHaveBeenCalledWith(jeremy.supabase, ybt, 'meeting-1', { setting: 'paused', isOn: true }, expect.objectContaining({ accountId: 'jeremy' }));
		expect(await run('change_own_claude_setting', jeremy, { setting: 'muted', isOn: true })).toBe(seatControlRefusals.settingUnknown);
		expect(await run('answer_held_contribution', jeremy, { heldId, answer: 'yes' })).toBe('Said in the room.');
		expect(answering).toHaveBeenCalledWith(jeremy.supabase, ybt, 'meeting-1', { heldId, isYes: true }, expect.objectContaining({ accountId: 'jeremy' }));
		expect(await run('answer_held_contribution', jeremy, { heldId: 'that one', answer: 'yes' })).toBe(seatControlRefusals.heldIdNotAnId);
	});

	it('passes on what the seat refuses, in its words', async () => {
		answering.mockResolvedValue({ answer: seatControlRefusals.noSuchHeldPiece, isKept: false });
		expect(await run('answer_held_contribution', jeremy, { heldId, answer: 'no' })).toBe(seatControlRefusals.noSuchHeldPiece);
	});

	it('is for a sitting director only, through the boardroom gate', async () => {
		expect(await run('steer_own_claude', james, { words: 'Go on.' })).toBe(notADirector);
		expect(steering).not.toHaveBeenCalled();
	});
});
