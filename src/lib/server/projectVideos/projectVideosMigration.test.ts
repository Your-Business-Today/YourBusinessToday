import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { projectVideoBucket } from './projectVideoStorage';
import { VideoLimits, captionsTypes, thumbnailTypes, videoFileTypes } from '$lib/projectVideos/videoLimits';

const migration = readFileSync('migrations/0266_project_videos.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const quotedList = (types: readonly string[]) => types.map((type) => `'${type}'`).join(', ');

describe('the project videos migration', () => {
	it('creates only a table of its own, behind a guard', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(['project_videos']);
		expect(statements).toContain("raise exception 'public.project_videos already exists in another shape");
	});

	it('lets only the people who can reach the project near its videos and their files', () => {
		const policies = statements.split('create policy').slice(1);
		expect(policies).toHaveLength(7);
		for (const policy of policies) expect(policy).toContain('public.can_reach_project(');
	});

	it('keeps films and thumbnails in a private bucket at the size and types the app checks', () => {
		const bucketTypes = quotedList([...videoFileTypes, ...thumbnailTypes, ...captionsTypes]);
		expect(statements).toContain(`values ('${projectVideoBucket}', '${projectVideoBucket}', false, ${VideoLimits.largestByteCount},`);
		expect(statements.replace(/\s+/g, ' ')).toContain(`array[${bucketTypes}]`);
		expect(statements).toContain(`mime_type in (${quotedList(videoFileTypes)})`);
	});

	it('holds each column to the limit the app checks', () => {
		const { longestTitle, longestDescription, longestSection, longestFilename, highestPosition, longestDurationSeconds, largestByteCount } = VideoLimits;
		expect(statements).toContain(`char_length(title) between 1 and ${longestTitle}`);
		expect(statements).toContain(`char_length(description) <= ${longestDescription}`);
		expect(statements).toContain(`char_length(section) between 1 and ${longestSection}`);
		expect(statements).toContain(`char_length(filename) between 1 and ${longestFilename}`);
		expect(statements).toContain(`position between 0 and ${highestPosition}`);
		expect(statements).toContain(`duration_seconds between 1 and ${longestDurationSeconds}`);
		expect(statements).toContain(`byte_count between 1 and ${largestByteCount}`);
	});
});
