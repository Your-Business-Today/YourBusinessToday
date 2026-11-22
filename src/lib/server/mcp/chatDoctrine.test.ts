import { describe, expect, it, vi } from 'vitest';
import { actionsFor } from './actionRegistry';
import { chatDoctrine } from './chatDoctrine';
import type { AccountStanding } from './resolveAccountStanding';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const snakeCaseName = /\b[a-z]+(?:_[a-z]+)+\b/g;
const someoneWhoIsNotStaff = { isAdmin: false, isStaff: false } as AccountStanding;

describe('the doctrine on taking part in the chat', () => {
	it('names only actions everyone is offered', () => {
		const offered = new Set(actionsFor(someoneWhoIsNotStaff, null).map((action) => action.name));
		const named = chatDoctrine.match(snakeCaseName) ?? [];
		expect(named.length).toBeGreaterThan(3);
		for (const name of named) expect(offered, name).toContain(name);
	});

	it('reads what is unread first and says where each thing was said', () => {
		expect(chatDoctrine).toContain('Read what is unread first, with read_chat_unread');
		expect(chatDoctrine).toContain('say which room each thing was said in');
	});

	it('posts only what the person agreed, in the right room, and offers to move a drifted talk', () => {
		expect(chatDoctrine).toContain('Post only what the person asked to say or has agreed to');
		expect(chatDoctrine).toContain('offer to move it');
	});

	it('moves, archives and renames only on the person’s yes, and marks read only once they have heard', () => {
		expect(chatDoctrine).toContain('Never move another person’s messages, archive a room or rename one without the person’s yes');
		expect(chatDoctrine).toContain('only after the person has been told what was new in it');
	});

	it('sends nothing outside Your Business Today', () => {
		expect(chatDoctrine).toContain('Nothing here sends an email or a message outside Your Business Today');
	});
});
