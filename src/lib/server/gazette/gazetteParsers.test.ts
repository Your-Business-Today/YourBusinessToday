import { describe, expect, it } from 'vitest';
import feedFixture from './fixtures/gazetteFeed.json';
import noticeFixture from './fixtures/noticeData.json';
import { companyNumberInData } from './readNoticeCompanyNumber';
import { entriesIn, parseGazetteNotice } from './gazetteNoticeRecord';

describe('parseGazetteNotice', () => {
	const notices = entriesIn(feedFixture).map(parseGazetteNotice);

	it('reads a winding-up petition with the company number from its text, zero-padded', () => {
		expect(notices[0]).toEqual({
			noticeId: '4567890',
			noticeUrl: 'https://www.thegazette.co.uk/notice/4567890',
			kind: 'winding_up_petitioned',
			publishedOn: '2026-10-11',
			companyNumber: '01234567'
		});
	});

	it('keeps a liquidator appointment whose text names no number, for its own data to answer', () => {
		expect(notices[1]?.kind).toBe('liquidator_appointed');
		expect(notices[1]?.companyNumber).toBe('');
	});

	it('leaves out a notice of a kind the feed does not carry, and reads one entry as well as many', () => {
		expect(notices[2]).toBeNull();
		expect(entriesIn({ feed: { entry: { id: 'https://www.thegazette.co.uk/notice/1' } } })).toHaveLength(1);
	});
});

describe('companyNumberInData', () => {
	it('finds the company number wherever the notice data nests it', () => {
		expect(companyNumberInData(noticeFixture)).toBe('SC123456');
		expect(companyNumberInData({ isAbout: { company: { companyNumber: 1234567 } } })).toBe('01234567');
		expect(companyNumberInData({})).toBe('');
	});
});
