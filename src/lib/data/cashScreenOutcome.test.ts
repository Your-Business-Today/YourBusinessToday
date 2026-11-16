import { describe, expect, it } from 'vitest';
import { accountsOutcomes } from './accountsReadingRules';
import { cashScreenOutcomes, screenVerdict, unreadVerdict } from './cashScreenOutcome';
import { connectionKinds } from './connectionRules';
import { cashOf, connectedNumber, connectedThrough, evidenceOf, leastCash, noConnections, readingOf, screenedNumber } from './cashScreenEvidence.fixture';

const microEntity = (companyNumber: string, currentAssets: number) => readingOf(companyNumber, accountsOutcomes.cashNotStated, { accountsType: 'micro-entity', currentAssets });

describe('what a screened company comes out as', () => {
	it('passes on its own cash, naming the day the accounts are made up to', () => {
		const verdict = screenVerdict(evidenceOf(cashOf(screenedNumber, 150_000), null), leastCash);
		expect(verdict.outcome).toBe(cashScreenOutcomes.passes);
		expect(verdict.reason).toContain('31 Mar 2026');
	});

	it.each([connectionKinds.directorOwns, connectionKinds.ownsThisCompany])('passes through a company connected as %s that has the cash, naming it', (kind) => {
		const evidence = evidenceOf(cashOf(screenedNumber, 5_000), connectedThrough(kind), [cashOf(connectedNumber, 400_000)]);
		const verdict = screenVerdict(evidence, leastCash);
		expect(verdict.outcome).toBe(cashScreenOutcomes.passesThroughConnected);
		expect(verdict.reason).toContain('SISTER BUILD LTD (07654321)');
	});

	it('is a maybe when it is a micro-entity whose current assets reach the figure', () => {
		const verdict = screenVerdict(evidenceOf(microEntity(screenedNumber, 120_000), noConnections()), leastCash);
		expect(verdict.outcome).toBe(cashScreenOutcomes.maybe);
		expect(verdict.reason).toContain('micro-entity');
	});

	it('is a maybe when a director owns a micro-entity whose current assets reach the figure', () => {
		const evidence = evidenceOf(cashOf(screenedNumber, 5_000), connectedThrough(connectionKinds.directorOwns), [microEntity(connectedNumber, 300_000)]);
		const verdict = screenVerdict(evidence, leastCash);
		expect(verdict.outcome).toBe(cashScreenOutcomes.maybe);
		expect(verdict.reason).toContain('A director owns a micro-entity');
	});

	it('is a maybe when a director only sits on a company that has the cash', () => {
		const evidence = evidenceOf(cashOf(screenedNumber, 5_000), connectedThrough(connectionKinds.directorSits), [cashOf(connectedNumber, 900_000)]);
		const verdict = screenVerdict(evidence, leastCash);
		expect(verdict.outcome).toBe(cashScreenOutcomes.maybe);
		expect(verdict.reason).toContain('only sits on');
	});

	it('is a maybe when its own accounts were filed only as a PDF nobody has read, giving the page', () => {
		const verdict = screenVerdict(evidenceOf(readingOf(screenedNumber, accountsOutcomes.pdfOnly), noConnections()), leastCash);
		expect(verdict.outcome).toBe(cashScreenOutcomes.maybe);
		expect(verdict.reason).toContain('save_company_accounts_reading');
	});

	it('is a maybe when an officer was left out for too many appointments, saying which', () => {
		const verdict = screenVerdict(evidenceOf(cashOf(screenedNumber, 5_000), noConnections(['FORMATIONS NOMINEES LIMITED'])), leastCash);
		expect(verdict.outcome).toBe(cashScreenOutcomes.maybe);
		expect(verdict.reason).toContain('FORMATIONS NOMINEES LIMITED');
	});

	it('fails when neither it nor any company it owns or that owns it has the cash', () => {
		const evidence = evidenceOf(cashOf(screenedNumber, 5_000), connectedThrough(connectionKinds.directorOwns), [cashOf(connectedNumber, 20_000)]);
		const verdict = screenVerdict(evidence, leastCash);
		expect(verdict.outcome).toBe(cashScreenOutcomes.fails);
		expect(verdict.reason).toContain('short of £100k');
	});

	it('is a maybe, never a fail, when nobody could read its accounts, saying how to read them again', () => {
		expect(unreadVerdict.outcome).toBe(cashScreenOutcomes.maybe);
		expect(unreadVerdict.reason).toContain('its cash is not known');
		expect(unreadVerdict.reason).toContain('read_company_accounts');
	});

	it('fails a new company with no accounts filed yet', () => {
		const verdict = screenVerdict(evidenceOf(readingOf(screenedNumber, accountsOutcomes.noAccounts, { madeUpTo: null }), noConnections()), leastCash);
		expect(verdict.outcome).toBe(cashScreenOutcomes.fails);
		expect(verdict.reason).toContain('No accounts filed yet.');
	});
});
