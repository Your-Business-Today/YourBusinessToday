import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordBoardroomPaperUpload } from './recordBoardroomPaperUpload';
import { boardPaperRefusals } from '$lib/data/boardroomPaperRules';
import { paperLinkLapsed, paperNotArrived } from '$lib/data/describeBoardroomPaper';
import { yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { BoardroomPaper } from '$lib/data/boardroomPaper';

const store = vi.hoisted(() => ({ paper: null as BoardroomPaper | null, arrivedSize: null as number | null, claims: [] as number[] }));

vi.mock('./getBoardroomPapers', () => ({ getBoardroomPaper: async () => store.paper }));
vi.mock('$lib/server/storage/measureStoredFile', () => ({ measureStoredFile: async () => store.arrivedSize }));

const claimingClient = {
	from: () => ({
		update: (row: { byte_count: number }) => {
			store.claims.push(row.byte_count);
			const answer = { data: [{ id: 'paper' }], error: null };
			const chain = { eq: () => chain, is: () => chain, select: async () => answer };
			return chain;
		}
	})
} as never;

const grantedFile: BoardroomPaper = {
	id: 'paper',
	organisationId: 'ybt',
	meetingId: 'meeting',
	agendaItemId: 'item-1',
	kind: 'file',
	title: 'Accounts',
	note: null,
	filename: 'accounts.pdf',
	mimeType: 'application/pdf',
	byteCount: null,
	storagePath: 'ybt/meeting/paper/accounts.pdf',
	addedByDirectorId: 'nigels-seat',
	addedBy: 'nigel',
	expiresAt: '2026-11-11T12:00:00.000Z',
	recordedAt: null,
	createdAt: '2026-11-11T10:00:00.000Z'
};
const withinTheHour = { accountId: 'nigel', now: new Date('2026-11-11T11:00:00Z') };
const theNextDay = { accountId: 'nigel', now: new Date('2026-11-12T11:00:00Z') };

function record(caller = withinTheHour) {
	return recordBoardroomPaperUpload(claimingClient, yourBusinessToday, 'paper', caller);
}

describe('recording a file sent to a granted link', () => {
	beforeEach(() => {
		store.paper = grantedFile;
		store.arrivedSize = 2048;
		store.claims = [];
	});

	it('keeps the paper at the size that actually arrived', async () => {
		expect(await record()).toContain('2 KB');
		expect(store.claims).toEqual([2048]);
	});

	it('says when nothing has arrived yet, and when the link lapsed unused', async () => {
		store.arrivedSize = null;
		expect(await record()).toBe(paperNotArrived);
		expect(await record(theNextDay)).toBe(paperLinkLapsed);
		expect(store.claims).toEqual([]);
	});

	it('keeps a file that arrived however late it is recorded', async () => {
		expect(await record(theNextDay)).toContain('is kept with the meeting');
	});

	it('records only a file granted to the director asking', async () => {
		expect(await record({ ...withinTheHour, accountId: 'jeremy' })).toBe(boardPaperRefusals.noSuchUpload);
		store.paper = { ...grantedFile, kind: 'note', storagePath: null };
		expect(await record()).toBe(boardPaperRefusals.noSuchUpload);
		expect(store.claims).toEqual([]);
	});
});
