import { describe, expect, it } from 'vitest';
import { refusalOfPick, rememberedWithChoice, validateFramePickChoice } from './framePickChoice';
import type { FramePicks } from '$lib/components/frame/framePicks';

const organisationId = '11111111-1111-4111-8111-111111111111';
const projectId = '33333333-3333-4333-8333-333333333333';
const otherProjectId = '44444444-4444-4444-8444-444444444444';

const picks: FramePicks = {
	organisations: [{ id: organisationId, name: 'Harbour Builders' }],
	pickedOrganisationId: organisationId,
	projects: [{ id: projectId, name: 'Harbour site' }],
	pickedProjectId: projectId,
	projectLinks: [],
	moduleLinks: [],
	homePath: `/projects/${projectId}`
};

describe('validateFramePickChoice', () => {
	it('reads an organisation alone, or with one of its projects', () => {
		expect(validateFramePickChoice({ organisationId })).toEqual({ organisationId, projectId: null });
		expect(validateFramePickChoice({ organisationId, projectId })).toEqual({ organisationId, projectId });
	});

	it('refuses anything that is not an id from the lists', () => {
		expect(validateFramePickChoice(null)).toHaveProperty('refusal');
		expect(validateFramePickChoice({ organisationId: 'Harbour' })).toHaveProperty('refusal');
		expect(validateFramePickChoice({ organisationId, projectId: 'site' })).toHaveProperty('refusal');
	});
});

describe('rememberedWithChoice', () => {
	const remembered = { organisationId: null, projectIdByOrganisation: { [organisationId]: otherProjectId } };

	it('keeps the organisation’s last project when only the organisation is picked', () => {
		const choice = { organisationId, projectId: null };
		expect(rememberedWithChoice(remembered, choice)).toEqual({ ...remembered, organisationId });
	});

	it('takes the project picked as the organisation’s last', () => {
		const choice = { organisationId, projectId };
		const after = rememberedWithChoice(remembered, choice);
		expect(after.projectIdByOrganisation[organisationId]).toBe(projectId);
	});
});

describe('refusalOfPick', () => {
	it('lets a pick stand when the picks read back show it', () => {
		expect(refusalOfPick(picks, { organisationId, projectId })).toBeNull();
		expect(refusalOfPick(picks, { organisationId, projectId: null })).toBeNull();
	});

	it('refuses an organisation or a project that is not among the person’s', () => {
		const strangerId = '55555555-5555-4555-8555-555555555555';
		expect(refusalOfPick(picks, { organisationId: strangerId, projectId: null })).toHaveProperty('refusal');
		expect(refusalOfPick(picks, { organisationId, projectId: otherProjectId })).toHaveProperty('refusal');
	});
});
