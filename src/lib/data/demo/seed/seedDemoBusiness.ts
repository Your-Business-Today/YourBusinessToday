import type { DemoBusiness } from '../demoBusiness';
import { seedBrain, demoSystems } from './seedBrainAndSystems';
import { demoClients, demoJobs, demoPeople } from './seedClientsAndJobs';
import { seedInvoices, seedQuotes } from './seedQuotesAndInvoices';
import { demoSubscriptions, seedInbox } from './seedSubscriptionsAndInbox';

export const demoBusinessName = 'Harbourside Joinery Ltd';

/** A fresh copy of the made-up business, its dates set relative to the day it starts. */
export function seedDemoBusiness(today: string): DemoBusiness {
	return {
		name: demoBusinessName,
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
		systems: demoSystems,
		log: [{ on: today, sentence: 'Your private copy of the demo started fresh.' }]
	};
}
