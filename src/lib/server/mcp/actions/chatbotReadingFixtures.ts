import { chatbotReadingActions } from './chatbotReadingActions';
import { chatbotId, siteTeam } from './businessBrainChatbotFixtures';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

/** The people, chatbot memberships and pages the tests of reading through a chatbot use. */
export { chatbotId, siteTeam };

export type MemberRow = { chatbot_id: string; organisation_id: string; email: string; removed_at: string | null };

export const stuartOnSiteTeam: MemberRow = { chatbot_id: chatbotId, organisation_id: 'jewel', email: 'stuart@example.com', removed_at: null };

export const processPageId = '00000000-0000-0000-0000-00000000000a';
export const peoplePageId = '00000000-0000-0000-0000-00000000000c';

export const ladderRule = {
	pageId: processPageId,
	partKind: 'process',
	parentPageId: null,
	kind: 'rule',
	title: 'Ladders at the end of the day',
	summary: '',
	body: 'Ladders are tied off or taken down.',
	facts: {},
	source: null,
	updatedAt: '2026-11-03T09:00:00Z'
};

export const payrollContacts = { ...ladderRule, pageId: peoplePageId, partKind: 'people', title: 'Payroll contacts', body: 'Ask Sam.' };

/** A stand-in for the members table: it answers the rows that match every filter the query sets. */
export function membersDatabase(rows: () => MemberRow[]) {
	const from = () => {
		const filters: Record<string, unknown> = {};
		const filterBy = (column: string, value: unknown) => {
			filters[column] = value;
			return query;
		};
		const query = {
			select: () => query,
			eq: filterBy,
			is: filterBy,
			then: (settle: (answer: unknown) => unknown) => settle({ data: rows().filter((row) => matchesEvery(row, filters)), error: null })
		};
		return query;
	};
	return { from };
}

function matchesEvery(row: MemberRow, filters: Record<string, unknown>): boolean {
	return Object.entries(filters).every(([column, value]) => row[column as keyof MemberRow] === value);
}

export function personSignedInAs(email: string, database: unknown): McpCaller {
	return { accountId: email, email, isStaff: false, organisationMemberships: [], supabase: database } as unknown as McpCaller;
}

export function chatbotReading(name: string): McpAction {
	return chatbotReadingActions.find((candidate) => candidate.name === name) as McpAction;
}
