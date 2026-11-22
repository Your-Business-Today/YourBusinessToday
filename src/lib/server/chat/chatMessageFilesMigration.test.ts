import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chatFileLimits, chatFileRefusals, chatFileTypes } from '$lib/data/chat/chatFileRules';
import { chatMessageLimits } from '$lib/data/chat/chatMessageRules';
import { chatFilesBucket } from './chatFileBucket';

const migration = readFileSync('migrations/0275_chat_message_files.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');
const quotedList = (values: readonly string[]) => values.map((value) => `'${value}'`).join(', ');
const { largestSizeBytes, longestFileName, longestContentType, mostFilesOnAMessage } = chatFileLimits;

describe('migration 0275, the photos and files a message carries, and the limits the site checks', () => {
	it('holds the same name, kind and size limits as the rules', () => {
		expect(statements).toContain(`check (char_length(file_name) between 1 and ${longestFileName})`);
		expect(statements).toContain(`check (char_length(content_type) between 1 and ${longestContentType})`);
		expect(statements).toContain(`check (size_bytes between 1 and ${largestSizeBytes})`);
		expect(statements).toContain('storage_path text not null unique');
	});

	it('keeps the files in a private bucket of the same size limit and the same kinds as the rules', () => {
		expect(statements).toContain(`values ('${chatFilesBucket}', '${chatFilesBucket}', false, ${largestSizeBytes},\n\tarray[${quotedList(chatFileTypes)}])`);
		expect(statements).toContain('on conflict (id) do nothing');
		expect(statements).not.toMatch(/on storage\.objects/);
	});

	it('ties a file to a message of the same organisation, never lets the message go, and never to a room, so a move keeps it', () => {
		expect(statements).toContain('foreign key (message_id, organisation_id)\n\t\treferences public.chat_messages (id, organisation_id) on delete restrict');
		const table = statements.slice(statements.indexOf('create table if not exists public.chat_message_files'), statements.indexOf('create index'));
		expect(table).not.toContain('room_id');
	});

	it("lets the organisation's people read the files by the module rule, with no policy to write", () => {
		expect(statements).toContain("on public.chat_message_files\n\tfor select using (public.can_use_organisation_module(organisation_id, 'chat'))");
		expect(statements).not.toMatch(/for (all|insert|update|delete)\b/);
	});

	it('lets a message have no words, still at most the words the rules allow, adding the wider check before dropping the narrower', () => {
		const widened = statements.indexOf(`check (char_length(body) <= ${chatMessageLimits.longestBody})`);
		const narrowerDropped = statements.indexOf('drop constraint if exists chat_messages_body_check');
		expect(widened).toBeGreaterThan(0);
		expect(narrowerDropped).toBeGreaterThan(widened);
	});

	it('writes a message and its files in one step, refusing in the words of the rules, for the service role alone', () => {
		expect(statements).toContain(`raise exception '${chatFileRefusals.wordsOrFiles}'`);
		expect(statements).toContain(`if file_count > ${mostFilesOnAMessage} then\n\t\traise exception '${chatFileRefusals.tooManyFiles}'`);
		expect(statements).toContain('from public, anon, authenticated;\ngrant execute on function public.post_chat_message_with_files(uuid, uuid, uuid, text, text, jsonb) to service_role;');
	});

	it('only adds: it drops no table or column, deletes no row and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b/);
		expect(statements).not.toMatch(/\bdelete from\b/);
		expect(statements).not.toMatch(/\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '5s';");
		expect(statements).toContain('create table if not exists public.chat_message_files');
	});
});
