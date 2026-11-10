import { describe, expect, it, vi } from 'vitest';
import { requireChatbotTrailReader } from './requireChatbotTrailReader';

const visit = vi.hoisted(() => ({ canManage: true, chatbots: [{ chatbotId: 'site-team', name: 'Site team' }] as unknown[] }));

vi.mock('$lib/server/auth/requireOrganisationModule', () => ({
	requireOrganisationModule: async () => ({ organisation: { id: 'jewel', name: 'Jewel Enterprises' }, canManage: visit.canManage })
}));
vi.mock('./readBusinessBrainChatbots', () => ({ readBusinessBrainChatbots: async () => visit.chatbots }));

const locals = { supabase: {} } as App.Locals;
const notFound = { status: 404 };

describe("the gate to a chatbot's record on the site", () => {
	it('lets a manager read the record of a chatbot of the organisation', async () => {
		visit.canManage = true;
		const place = await requireChatbotTrailReader(locals, 'jewel', 'site-team');
		expect(place.chatbot).toEqual({ chatbotId: 'site-team', name: 'Site team' });
	});

	it('shows anyone who does not manage the organisation no such chatbot', async () => {
		visit.canManage = false;
		await expect(requireChatbotTrailReader(locals, 'jewel', 'site-team')).rejects.toMatchObject(notFound);
		visit.canManage = true;
	});

	it('shows no record for a chatbot the organisation does not have', async () => {
		visit.chatbots = [];
		await expect(requireChatbotTrailReader(locals, 'jewel', 'site-team')).rejects.toMatchObject(notFound);
	});
});
