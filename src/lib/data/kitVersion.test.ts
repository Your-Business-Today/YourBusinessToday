import { describe, expect, it } from 'vitest';
import { compareKitVersions, describeKitStanding, kitStanding } from './kitVersion';

const onRepository = { hasRepository: true, isRead: true, latestKitVersion: '1.13.0' };

describe('compareKitVersions', () => {
	it('compares each part as a number, not as text', () => {
		expect(compareKitVersions('1.9.0', '1.13.0')).toBeLessThan(0);
		expect(compareKitVersions('1.13.0', '1.12.1')).toBeGreaterThan(0);
		expect(compareKitVersions('1.13.0', '1.13.0')).toBe(0);
	});

	it('treats a missing part as zero and ignores a leading v', () => {
		expect(compareKitVersions('1.13', '1.13.0')).toBe(0);
		expect(compareKitVersions('v1.12.1', '1.13.0')).toBeLessThan(0);
	});
});

describe('kitStanding', () => {
	it('is behind when the repository is on an older kit', () => {
		expect(kitStanding({ ...onRepository, kitVersion: '1.12.1' })).toBe('behind');
	});

	it('is current on the latest kit, or on one newer than the latest last read', () => {
		expect(kitStanding({ ...onRepository, kitVersion: '1.13.0' })).toBe('current');
		expect(kitStanding({ ...onRepository, kitVersion: '1.14.0' })).toBe('current');
	});

	it('says when there is no repository, no kit, or no latest version to compare with', () => {
		expect(kitStanding({ ...onRepository, hasRepository: false, kitVersion: '' })).toBe('no_repository');
		expect(kitStanding({ ...onRepository, kitVersion: '' })).toBe('no_kit');
		expect(kitStanding({ ...onRepository, kitVersion: '1.13.0', latestKitVersion: '' })).toBe('unknown_latest');
	});

	it('is not read, never kit-less, while the repository has not been read', () => {
		expect(kitStanding({ ...onRepository, isRead: false, kitVersion: '' })).toBe('not_read');
	});

	it('reads as a sentence on the project', () => {
		const reading = { ...onRepository, kitVersion: '1.12.1' };
		expect(describeKitStanding('behind', reading)).toBe('On kit 1.12.1, behind the latest 1.13.0.');
	});
});
