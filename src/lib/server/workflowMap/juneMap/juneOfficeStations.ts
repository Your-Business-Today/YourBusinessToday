import { juneStation } from './juneStation';

export const officeAndComplianceStations = [
	juneStation('subbie-onboarding', 'Subbie onboarding', 'Register a new subcontractor and open their compliance file.',
		{ takesIn: ['Subcontractor details', 'Trade and package'], produces: ['Compliance file'] }, 'Email and a shared folder'),
	juneStation('insurance-cis-checks', 'Insurance & CIS checks', 'Verify insurance, certifications and CIS status before any award can happen.',
		{ takesIn: ['Compliance file', 'Insurance certificates', 'CIS registration'], produces: ['Verified compliance record'] }, 'Spreadsheet'),
	juneStation('expiry-tracking', 'Expiry tracking', 'Track every insurance and certification expiry, chasing renewals before they lapse.',
		{ takesIn: ['Verified compliance record'], produces: ['Renewal chasers', 'Compliance alerts'] }, 'Spreadsheet')
];

export const projectManagerStations = [
	juneStation('project-setup', 'Project setup', 'Open the project shell the moment the opportunity is won.',
		{ takesIn: ['Won opportunity', 'Signed contract'], produces: ['Project record'] }, 'Shared folder'),
	juneStation('drawing-register', 'Drawing register', 'Receive every drawing revision and track who has acknowledged it.',
		{ takesIn: ['Drawing revisions'], produces: ['Drawing register entry', 'Issue acknowledgments'] }, 'Bluebeam'),
	juneStation('rfis-submittals', 'RFIs & submittals', 'Run RFIs and submittals so nothing is installed before the architect approves it.',
		{ takesIn: ['Site queries', 'Product data'], produces: ['Answered RFIs', 'Variation instruction'] }, 'Email'),
	juneStation('claim-issued', 'Claim issued', 'Issue the programme valuation report to the client and log their certification.',
		{ takesIn: ['Programme valuation report'], produces: ['Client certificate', 'Payment application'] }, 'Email')
];
