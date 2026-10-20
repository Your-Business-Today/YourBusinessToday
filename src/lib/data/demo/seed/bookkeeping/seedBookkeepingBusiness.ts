import { DemoKind } from '../../demoKinds';
import type { DemoBusiness } from '../../demoBusiness';
import { seedBrain, practiceSystems } from './seedBrainAndSystems';
import { practiceClients, practiceJobs, practicePeople } from './seedClientsAndJobs';
import { seedInvoices, seedQuotes } from './seedQuotesAndInvoices';
import { practiceSubscriptions, seedInbox } from './seedSubscriptionsAndInbox';

/** The made-up bookkeeping practice a bookkeeping prospect tries, dated from the day it starts. */
export function seedBookkeepingBusiness(today: string): Omit<DemoBusiness, 'log'> {
	return {
		kind: DemoKind.bookkeeping,
		name: 'Brightledger Bookkeeping Ltd',
		trade: 'Bookkeeping, VAT and payroll for small businesses, six people',
		town: 'Leeds',
		people: practicePeople,
		clients: practiceClients,
		jobs: practiceJobs,
		quotes: seedQuotes(today),
		invoices: seedInvoices(today),
		subscriptions: practiceSubscriptions,
		inbox: seedInbox(today),
		brain: seedBrain(today),
		systems: practiceSystems
	};
}
