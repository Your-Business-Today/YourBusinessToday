import { DemoKind } from '../../demoKinds';
import type { DemoBusiness } from '../../demoBusiness';
import { seedBrain, demoSystems } from './seedBrainAndSystems';
import { demoClients, demoJobs, demoPeople } from './seedClientsAndJobs';
import { seedInvoices, seedQuotes } from './seedQuotesAndInvoices';
import { demoSubscriptions, seedInbox } from './seedSubscriptionsAndInbox';

/** The made-up joinery firm a construction prospect tries, dated from the day it starts. */
export function seedJoineryBusiness(today: string): Omit<DemoBusiness, 'log'> {
	return {
		kind: DemoKind.construction,
		name: 'Harbourside Joinery Ltd',
		trade: 'Bespoke joinery and fit-out, twelve people',
		town: 'Bristol',
		people: demoPeople,
		clients: demoClients,
		jobs: demoJobs,
		quotes: seedQuotes(today),
		invoices: seedInvoices(today),
		subscriptions: demoSubscriptions,
		inbox: seedInbox(today),
		brain: seedBrain(today),
		systems: demoSystems
	};
}
