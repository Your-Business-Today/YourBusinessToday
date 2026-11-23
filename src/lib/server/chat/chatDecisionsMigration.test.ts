import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chatDecisionLimits, chatDecisionStatuses } from '$lib/data/chat/chatDecisionRules';
import { postedViaChannels } from '$lib/data/conversationTurn';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { chatDecisionColumns, chatDecisionsTable } from './chatDecisionRecord';

const migration = readFileSync('migrations/0277_chat_room_decisions.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');
const quotedList = (values: readonly string[]) => values.map((value) => `'${value}'`).join(', ');

describe('migration 0277, the decisions raised in a room, and the limits the site checks', () => {
	it('holds the same lengths, statuses and ways of raising as the rules, with every column the site reads', () => {
		expect(statements).toContain(`check (char_length(wording) between 1 and ${chatDecisionLimits.longestWording})`);
		expect(statements).toContain(`check (char_length(outcome) between 1 and ${chatDecisionLimits.longestOutcome})`);
		expect(statements).toContain(`default '${chatDecisionStatuses.open}' check (status in (${quotedList(Object.values(chatDecisionStatuses))}))`);
		expect(statements).toContain(`default '${postedViaChannels.site}' check (raised_via in (${quotedList(Object.values(postedViaChannels))}))`);
		for (const column of chatDecisionColumns.split(', ')) expect(statements).toMatch(new RegExp(`\\n\\t${column} `));
	});

	it('ties a decision to a room and a message of the same organisation, and never lets either go', () => {
		expect(statements).toContain('foreign key (room_id, organisation_id)\n\t\treferences public.chat_rooms (id, organisation_id) on delete restrict');
		expect(statements).toContain('foreign key (message_id, organisation_id)\n\t\treferences public.chat_messages (id, organisation_id) on delete restrict');
		expect(statements).toContain('waiting_on_account_id uuid not null,\n');
	});

	it('keeps a closed row whole and an open row with no outcome, and refuses any change but closing', () => {
		expect(statements).toContain("(status = 'open' and outcome is null and closed_by_account_id is null and closed_at is null)");
		expect(statements).toContain("(status = 'closed' and outcome is not null and closed_by_account_id is not null and closed_at is not null)");
		expect(statements).toContain("if old.status = 'closed' then");
		expect(statements).toContain('before update on public.chat_decisions');
	});

	it("lets the organisation's people read the decisions by the module rule, with no policy to write", () => {
		expect(statements).toContain(`on public.${chatDecisionsTable}\n\tfor select using (public.can_use_organisation_module(organisation_id, 'chat'))`);
		expect(statements).not.toMatch(/for (all|insert|update|delete)\b/);
		expect(tablesKeptByOrganisation).toContain(chatDecisionsTable);
	});

	it('only adds: it drops no table or column, deletes or updates no row and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b/);
		expect(statements).not.toMatch(/\bdelete from\b/);
		expect(statements).not.toMatch(/\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '5s';");
		expect(statements).toContain(`create table if not exists public.${chatDecisionsTable}`);
	});
});
