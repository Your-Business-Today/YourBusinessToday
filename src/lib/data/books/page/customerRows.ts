/** A customer as the Invoices page's Customers tab lists it: who, who to send to, how many invoices, and what it owes. */
export type CustomerRow = {
	id: string;
	name: string;
	contact: string;
	email: string;
	invoiceCount: number;
	owed: number;
};

/** A billing schedule as the Schedules tab lists it: whose, what for, what each invoice comes to, how often and when next. */
export type ScheduleRow = {
	id: string;
	customer: string;
	title: string;
	amount: number;
	howOften: string;
	nextInvoice: string;
	isSentByItself: boolean;
	isPaused: boolean;
};
