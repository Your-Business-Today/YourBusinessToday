export type MockupTile = { label: string; value: string; note: string };

export type MockupOrder = { customer: string; order: string; value: string; status: string };

export const appMockupName = 'YourApp';

export const appMockupNavigation = [
	'Overview',
	'Customers',
	'Orders',
	'Jobs',
	'Invoices',
	'Team',
	'Documents',
	'Reports',
	'Assistant',
	'Settings'
];

export const appMockupGreeting = {
	heading: 'Good morning, Sam',
	line: 'Everything your business did this week, in one place.',
	period: 'This month'
};

/** Every figure here is invented: the picture shows the kind of app we build, not a real business. */
export const appMockupTiles: MockupTile[] = [
	{ label: 'Revenue', value: '£184,200', note: '▲ 12% on last month' },
	{ label: 'Open orders', value: '46', note: '▲ 8 this week' },
	{ label: 'Overdue invoices', value: '£12,480', note: '3 customers' },
	{ label: 'Customer rating', value: '4.8/5', note: '▲ 0.2' }
];

export const appMockupCashChart = {
	title: 'Cash ahead, next 12 weeks',
	values: [18, 22, 20, 26, 24, 30, 28, 34, 33, 38, 42, 47]
};

export const appMockupDecisions = {
	title: 'Needs a decision',
	items: ['3 invoices past due', 'Bright Lane quote expires Friday', 'Van service due next week']
};

export const appMockupOrders = {
	title: 'Latest orders',
	columns: ['Customer', 'Order', 'Value', 'Status'],
	rows: [
		{ customer: 'Northfield Ltd', order: '#2041', value: '£4,200', status: 'In progress' },
		{ customer: 'Harbour & Co', order: '#2040', value: '£1,850', status: 'Awaiting sign-off' },
		{ customer: 'Kestrel Foods', order: '#2039', value: '£6,400', status: 'Invoiced' }
	] as MockupOrder[]
};
