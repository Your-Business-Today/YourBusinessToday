import type { LineMapModel, MapLine } from '../layout/lineMapModel';

const journeys: Record<string, string[]> = {
	'browse-the-content-library': ['/organisations/{organisationId}/brand', '/organisations/{organisationId}/brand/library', '/organisations/{organisationId}/brand/content/{contentPieceId}'],
	'change-display-name': ['/account'],
	'check-a-clients-workflow-map': ['/clients', '/{register}/{clientId}', '/{register}/{clientId}/workflow-map'],
	'check-kit-versions': ['/projects', '/projects/kit-versions'],
	'check-the-autocomplete-register': ['/projects', '/projects/autocomplete'],
	'deploy-now': ['/projects', '/projects/{projectId}', '/projects/{projectId}/staged', '/projects/{projectId}/deploys'],
	'find-a-companys-people': ['/leads', '/people', '/people/{personId}', '/{register}/{clientId}'],
	'follow-the-patch-feed': ['/leads', '/clients/feed', '/{register}/{clientId}'],
	'hold-a-board-meeting': ['/organisations/{organisationId}/boardroom', '/organisations/{organisationId}/boardroom/{meetingId}'],
	'keep-the-business-brain': ['/organisations/{organisationId}/business-brain', '/organisations/{organisationId}/business-brain/pages/{pageId}'],
	'log-a-conversation': ['/leads', '/{register}/{clientId}'],
	'look-at-the-area-map': ['/leads', '/clients/map', '/{register}/{clientId}'],
	'manage-the-teams-jobs': ['/organisations/{organisationId}/task-management', '/projects/{projectId}/tasks/{taskId}'],
	'plan-brand-content': ['/organisations/{organisationId}/brand', '/organisations/{organisationId}/brand/plan', '/organisations/{organisationId}/brand/content/{contentPieceId}'],
	'prospect-a-patch': ['/leads', '/clients/patches', '/clients/patches/{patchId}', '/clients/patches/{patchId}/sectors/{sector}', '/clients/patches/{patchId}/sightings', '/{register}/{clientId}'],
	'prospect-on-companies-house': ['/leads', '/clients/prospect', '/{register}/{clientId}'],
	'read-the-site-map': ['/projects', '/projects/{projectId}', '/projects/{projectId}/site-map'],
	'read-notifications': ['/notifications', '/projects/{projectId}/tasks/{taskId}'],
	'read-the-books': ['/organisations/{organisationId}/books', '/organisations/{organisationId}/books/accounts/{accountCode}'],
	'read-the-domain': ['/organisations/{organisationId}/domain', '/organisations/{organisationId}/workflow-map'],
	'read-the-workflow-map': ['/organisations/{organisationId}/workflow-map', '/organisations/{organisationId}/domain'],
	'read-chatbot-questions': ['/organisations/{organisationId}/business-brain', '/organisations/{organisationId}/business-brain/chatbots/{chatbotId}/questions'],
	'research-a-company': ['/leads', '/{register}/{clientId}', '/clients/research'],
	'run-a-campaign': ['/organisations/{organisationId}/brand', '/organisations/{organisationId}/brand/campaigns/{campaignId}'],
	'see-a-products-stations': ['/projects', '/projects/{projectId}', '/projects/{projectId}/workflow-map', '/organisations/{organisationId}/workflow-map'],
	'see-an-organisation': ['/organisations', '/organisations/{organisationId}'],
	'see-who-brought-in-leads': ['/leaderboard', '/{register}/{clientId}'],
	'see-whos-on-a-project': ['/projects', '/projects/{projectId}', '/projects/{projectId}/people'],
	'set-a-products-goals': ['/projects', '/projects/{projectId}', '/projects/{projectId}/goals', '/projects/{projectId}/goals/{goalId}', '/projects/{projectId}/tasks/{taskId}'],
	'sign-in-as-staff': ['/account/sign-in', '/organisations/{organisationId}'],
	'use-the-prospecting-page': ['/organisations/{organisationId}/sales', '/clients/patches'],
	'work-the-board': ['/projects', '/projects/{projectId}', '/projects/{projectId}/tasks/{taskId}']
};

const lines: MapLine[] = Object.entries(journeys).map(([id, stops]) => ({ id, name: id, colour: 'sky', stops }));
const routes = [...new Set(lines.flatMap((line) => line.stops))];

/** The staff member's 32 journeys on the YourBusinessToday site map as filed on 13 Nov 2026, the map that froze the page. */
export const ybtStaffJourneys: LineMapModel = {
	lines,
	stations: Object.fromEntries(routes.map((route) => [route, { name: route, state: 'elsewhere' }])),
	handovers: []
};
