import { DemoJobStatus, type DemoClient, type DemoJob, type DemoPerson } from '../../demoBusiness';

export const PracticeClientId = {
	coffee: 'kirkgate-coffee-roasters',
	plumbing: 'northfield-plumbing-and-heating',
	dental: 'aire-valley-dental',
	architects: 'calder-studio-architects',
	garage: 'moor-lane-garage'
} as const;

export const PracticeJobId = {
	coffeeVatQuarter: 'JOB-2041',
	plumbingYearEnd: 'JOB-2044',
	dentalPayroll: 'JOB-2038',
	architectsCatchUp: 'JOB-2036',
	garageBookkeeping: 'JOB-2049'
} as const;

export const practicePeople: DemoPerson[] = [
	{ name: 'Rachel Hollis', role: 'Director, prices the work and signs off every year-end' },
	{ name: 'Imran Shah', role: 'Senior bookkeeper, closes the monthly books and the VAT returns' },
	{ name: 'Gemma Ward', role: 'Payroll, runs the monthly payrolls in BrightPay' },
	{ name: 'Josh Leigh', role: 'Trainee, chases the receipts and keeps Dext tidy' }
];

export const practiceClients: DemoClient[] = [
	{ id: PracticeClientId.coffee, name: 'Kirkgate Coffee Roasters', contact: 'Aisha Khan, owner' },
	{ id: PracticeClientId.plumbing, name: 'Northfield Plumbing & Heating Ltd', contact: 'Gary Barker, director' },
	{ id: PracticeClientId.dental, name: 'Aire Valley Dental Practice', contact: 'Helen Moss, practice manager' },
	{ id: PracticeClientId.architects, name: 'Calder Studio Architects', contact: 'Owen Price, partner' },
	{ id: PracticeClientId.garage, name: 'Moor Lane Garage', contact: 'Steve Firth, owner' }
];

export const practiceJobs: DemoJob[] = [
	{
		id: PracticeJobId.coffeeVatQuarter,
		clientId: PracticeClientId.coffee,
		name: 'Monthly books and VAT return, quarter to September',
		status: DemoJobStatus.inProgress,
		workDone: 2_850,
		invoiced: 1_900
	},
	{
		id: PracticeJobId.plumbingYearEnd,
		clientId: PracticeClientId.plumbing,
		name: 'Year-end accounts and corporation tax return',
		status: DemoJobStatus.finished,
		workDone: 3_200,
		invoiced: 0
	},
	{
		id: PracticeJobId.dentalPayroll,
		clientId: PracticeClientId.dental,
		name: 'Monthly payroll for fourteen staff',
		status: DemoJobStatus.inProgress,
		workDone: 4_200,
		invoiced: 4_200
	},
	{
		id: PracticeJobId.architectsCatchUp,
		clientId: PracticeClientId.architects,
		name: 'Bookkeeping catch-up, eighteen months',
		status: DemoJobStatus.finished,
		workDone: 5_400,
		invoiced: 5_400
	},
	{
		id: PracticeJobId.garageBookkeeping,
		clientId: PracticeClientId.garage,
		name: 'Monthly bookkeeping from November',
		status: DemoJobStatus.quoted,
		workDone: 0,
		invoiced: 0
	}
];
