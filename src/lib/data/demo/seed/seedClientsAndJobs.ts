import { DemoJobStatus, type DemoClient, type DemoJob, type DemoPerson } from '../demoBusiness';

export const DemoClientId = {
	oakwell: 'oakwell-developments',
	hotel: 'bristol-harbour-hotel',
	school: 'meadow-lane-primary',
	architects: 'caldwell-and-finch',
	cafe: 'the-grainstore-cafe'
} as const;

export const DemoJobId = {
	plotFourKitchen: 'JOB-0112',
	hotelBar: 'JOB-0115',
	schoolLibrary: 'JOB-0109',
	cafeCounter: 'JOB-0118',
	plotSixWardrobes: 'JOB-0121'
} as const;

export const demoPeople: DemoPerson[] = [
	{ name: 'Dan Pritchard', role: 'Director, prices the big jobs and runs the sites' },
	{ name: 'Sam Okafor', role: 'Office manager, raises invoices and keeps Xero' },
	{ name: 'Priya Nair', role: 'Estimator, prices the smaller jobs from the drawings' },
	{ name: 'Lee Marsh', role: 'Site foreman, runs the eight joiners on site' }
];

export const demoClients: DemoClient[] = [
	{ id: DemoClientId.oakwell, name: 'Oakwell Developments', contact: 'Marie Holt, quantity surveyor' },
	{ id: DemoClientId.hotel, name: 'Bristol Harbour Hotel', contact: 'Tom Ashby, finance' },
	{ id: DemoClientId.school, name: 'Meadow Lane Primary School', contact: 'Jo Bennett, bursar' },
	{ id: DemoClientId.architects, name: 'Caldwell & Finch Architects', contact: 'Ella Caldwell, partner' },
	{ id: DemoClientId.cafe, name: 'The Grainstore Café', contact: 'Ben Rowe, owner' }
];

export const demoJobs: DemoJob[] = [
	{
		id: DemoJobId.plotFourKitchen,
		clientId: DemoClientId.oakwell,
		name: 'Plot 4 kitchen and staircase, Oakwell Rise',
		status: DemoJobStatus.inProgress,
		workDone: 28_400,
		invoiced: 18_000
	},
	{
		id: DemoJobId.hotelBar,
		clientId: DemoClientId.hotel,
		name: 'Bar and reception joinery',
		status: DemoJobStatus.inProgress,
		workDone: 46_200,
		invoiced: 46_200
	},
	{
		id: DemoJobId.schoolLibrary,
		clientId: DemoClientId.school,
		name: 'Library shelving and cloakroom benches',
		status: DemoJobStatus.finished,
		workDone: 12_750,
		invoiced: 8_500
	},
	{
		id: DemoJobId.cafeCounter,
		clientId: DemoClientId.cafe,
		name: 'Counter and banquette seating',
		status: DemoJobStatus.finished,
		workDone: 9_600,
		invoiced: 9_600
	},
	{
		id: DemoJobId.plotSixWardrobes,
		clientId: DemoClientId.oakwell,
		name: 'Plot 6 fitted wardrobes, Oakwell Rise',
		status: DemoJobStatus.quoted,
		workDone: 0,
		invoiced: 0
	}
];
