import { describe, expect, it } from 'vitest';
import { describeClientInFull } from './describeClient';
import { parseClientRecord } from '$lib/server/clients/clientRecord';
import { parsePremisesRecord } from '$lib/server/premises/premisesRecord';
import { premisesRowOf } from '$lib/server/premises/premisesTable.fixture';

const ownSite = 'https://thelamb.example/';
const socialPage = 'https://www.instagram.com/thelambsurbiton';
const leadRow = { id: 'client-1', name: 'The Lamb', lifecycle_stage: 'lead', lead_source: 'places_dataset', industry: 'pub', is_archived: false, created_at: '2026-11-15T10:00:00Z' };
const placeRow = { source: 'places_dataset', business_type: 'pub', rating_value: '', phone: '+442083990000', source_url: 'https://explore.overturemaps.org/#lamb' };
const broughtInBy = 'James';

function readingOf(website: string, listedPage: string, isMadeFromPremises = true): string[] {
	const client = parseClientRecord({ ...leadRow, website });
	const premises = isMadeFromPremises ? [parsePremisesRecord(premisesRowOf({ ...placeRow, website: listedPage }))] : [];
	return describeClientInFull({ client, broughtInBy, organisation: null, premises }, { contacts: [], projects: [], conversations: [], emails: [], quote: null }).split('\n');
}

describe('one client in full, as a Claude reads it', () => {
	it('says where a company made from a premises trades, after its profile and before its contacts', () => {
		const lines = readingOf(ownSite, ownSite);
		const heading = lines.indexOf('Trading at:');
		expect(heading).toBeGreaterThan(lines.indexOf('Company profile:'));
		expect(heading).toBeLessThan(lines.indexOf('Contacts:'));
		expect(lines[heading + 1]).toContain('phone +442083990000 — listed by Overture Maps Places');
	});

	it('gives the page the place lists only where the company did not take it as its website', () => {
		expect(readingOf(ownSite, ownSite).join('\n')).not.toContain('listed page');
		expect(readingOf('', socialPage).join('\n')).toContain(`listed page ${socialPage}`);
	});

	it('has no trading line for a company made any other way', () => {
		expect(readingOf(ownSite, '', false)).not.toContain('Trading at:');
	});
});
