export type ClientBusiness = {
	id: string;
	kind: string;
	whatRunsOnIt: string;
};

/** The businesses that run on a portal we built, by kind only. A client's portal is its own and so is its name. */
export const clientBusinesses: ClientBusiness[] = [
	{
		id: 'construction-company',
		kind: 'A construction company',
		whatRunsOnIt:
			'Every project at the stage it is really at. RFIs, variations, the monthly valuation and a thirteen week cashflow read from Xero, with the day on site arriving as messages and photographs.'
	},
	{
		id: 'fire-door-company',
		kind: 'A fire door company',
		whatRunsOnIt:
			'Surveys that become quotes and quotes that become jobs. Every doorset inspected and certified on record, and the handover pack that proves the work was done.'
	},
	{
		id: 'property-management-company',
		kind: 'A property management company',
		whatRunsOnIt:
			'Properties, tenants and the jobs on each one. Visits and work orders for the team on the road, key holdings, compliance certificates and the invoices that follow.'
	}
];
