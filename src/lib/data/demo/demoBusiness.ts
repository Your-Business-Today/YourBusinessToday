import type { DemoKindValue } from './demoKinds';

export type DemoPerson = { name: string; role: string };

export type DemoClient = { id: string; name: string; contact: string };

export const DemoJobStatus = {
	quoted: 'quoted',
	inProgress: 'in progress',
	finished: 'finished'
} as const;
export type DemoJobStatusValue = (typeof DemoJobStatus)[keyof typeof DemoJobStatus];

export type DemoJob = {
	id: string;
	clientId: string;
	name: string;
	status: DemoJobStatusValue;
	workDone: number;
	invoiced: number;
};

export const DemoQuoteStatus = { sent: 'sent', accepted: 'accepted', declined: 'declined' } as const;
export type DemoQuoteStatusValue = (typeof DemoQuoteStatus)[keyof typeof DemoQuoteStatus];

export type DemoQuote = {
	id: string;
	clientId: string;
	work: string;
	amount: number;
	sentOn: string;
	status: DemoQuoteStatusValue;
	chasedOn: string | null;
};

export const DemoInvoiceStatus = { unpaid: 'unpaid', paid: 'paid' } as const;
export type DemoInvoiceStatusValue = (typeof DemoInvoiceStatus)[keyof typeof DemoInvoiceStatus];

export type DemoInvoice = {
	id: string;
	clientId: string;
	jobId: string;
	amount: number;
	issuedOn: string;
	dueOn: string;
	status: DemoInvoiceStatusValue;
	chasedOn: string | null;
};

export type DemoSubscription = {
	id: string;
	name: string;
	monthlyCost: number;
	paidBy: string;
	cancelledOn: string | null;
};

export type DemoEmail = {
	id: string;
	from: string;
	subject: string;
	receivedOn: string;
	summary: string;
};

export type DemoBrainNote = { id: string; note: string; learnedOn: string };

export type DemoLinkedSystem = { name: string; holds: string; claudeReaches: string };

export type DemoLogEntry = { on: string; sentence: string };

/** One prospect's private copy of the made-up business, held whole as one document. */
export type DemoBusiness = {
	kind: DemoKindValue;
	name: string;
	trade: string;
	town: string;
	people: DemoPerson[];
	clients: DemoClient[];
	jobs: DemoJob[];
	quotes: DemoQuote[];
	invoices: DemoInvoice[];
	subscriptions: DemoSubscription[];
	inbox: DemoEmail[];
	brain: DemoBrainNote[];
	systems: DemoLinkedSystem[];
	log: DemoLogEntry[];
};
