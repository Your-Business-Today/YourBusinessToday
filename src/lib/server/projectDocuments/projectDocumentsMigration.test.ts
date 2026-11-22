import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DocumentLimits, documentFileTypes } from '$lib/projectDocuments/documentLimits';
import { projectDocumentBucket } from './projectDocumentFiles';

const migration = readFileSync('migrations/0268_project_documents.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const quotedList = (types: readonly string[]) => types.map((type) => `'${type}'`).join(', ');

describe('the project documents migration', () => {
	it('creates only a table of its own, behind a guard', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(['project_documents']);
		expect(statements).toContain("raise exception 'public.project_documents already exists in another shape");
		expect(statements).not.toMatch(/drop table|drop column|rename /);
	});

	it('lets only the people who can reach the project near its documents and their files', () => {
		const policies = statements.split('create policy').slice(1);
		expect(policies).toHaveLength(7);
		for (const policy of policies) expect(policy).toContain('public.can_reach_project(');
	});

	it('keeps files in a private bucket at the size and types the app checks', () => {
		expect(statements).toContain(`values ('${projectDocumentBucket}', '${projectDocumentBucket}', false, ${DocumentLimits.largestByteCount},`);
		expect(statements.replace(/\s+/g, ' ')).toContain(`array[${quotedList(documentFileTypes)}]`);
		expect(statements).toContain(`mime_type in (${quotedList(documentFileTypes)})`);
	});

	it('holds each column to the limit the app checks', () => {
		const { longestTitle, longestSummary, longestSection, longestFilename, longestMarkdown, highestPosition, largestByteCount } = DocumentLimits;
		expect(statements).toContain(`char_length(title) between 1 and ${longestTitle}`);
		expect(statements).toContain(`char_length(summary) <= ${longestSummary}`);
		expect(statements).toContain(`char_length(section) between 1 and ${longestSection}`);
		expect(statements).toContain(`char_length(filename) between 1 and ${longestFilename}`);
		expect(statements).toContain(`char_length(markdown) between 1 and ${longestMarkdown}`);
		expect(statements).toContain(`position between 0 and ${highestPosition}`);
		expect(statements).toContain(`byte_count between 1 and ${largestByteCount}`);
	});
});
