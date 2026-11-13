import { companyDetails } from '$lib/data/companyDetails';
import { confirmCompanyContext } from '$lib/server/companyContext/confirmCompanyContext';
import { describeCompanyContext } from './describeCompanyContext';
import { describeVisitorStanding, clientIdField, withPortalVisitor } from '../portalVisitorAccess';
import { isRefusal } from '$lib/server/portal/portalFormReading';
import { isRefused } from '$lib/server/companyContext/contextText';
import { markContextPart } from '$lib/server/companyContext/markContextPart';
import { objectSchema, readText, textField } from '../actionTypes';
import { readCompanyContextOfClient } from '$lib/server/companyContext/readCompanyContextOfClient';
import { readVersionNumber, validatePartMarkValues } from '$lib/server/companyContext/validatePartMark';
import { reviewStates } from '$lib/data/companyContext/companyContext';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

export const noContextRecordedYet =
	'Your company context has not been recorded yet. It is recorded by your own Claude when you run its prompt, and then it is yours to check here.';
const versionNumberField = textField('The version you are marking, as read_my_company_context gives it');
const markGuidance =
	'The map in your portal is where you mark each part of your company context right or not right, and this is the same mark. ' +
	'Mark a part only as the person says, in their words: a part marked not right carries what is wrong for their Claude to put right. ' +
	'A confirmed version takes no more marks.';

export const portalContextActions: McpAction[] = [
	{
		name: 'read_my_company_context',
		area: 'support',
		audience: 'everyone',
		isWrite: false,
		summary: "for a client contact: your company's context as the map in your portal shows it, with each part's review and whether it is confirmed",
		guidance: 'Read it before marking a part or confirming: the marks and the confirmation name the version it shows.',
		inputSchema: objectSchema({ clientId: clientIdField }),
		run: async (caller, input) => withPortalVisitor(caller, input, readContext)
	},
	{
		name: 'mark_context_part',
		area: 'support',
		audience: 'everyone',
		isWrite: true,
		summary: 'for a client contact: mark one part of your company context right, or not right with what is wrong',
		guidance: markGuidance,
		inputSchema: objectSchema(
			{
				clientId: clientIdField,
				versionNumber: versionNumberField,
				partKey: textField('The part, by the key read_my_company_context shows beside its name'),
				reviewState: { type: 'string', enum: [reviewStates.right, reviewStates.notRight], description: 'right, or not_right' },
				whatIsWrong: textField('With not_right: what is wrong, in their words')
			},
			['versionNumber', 'partKey', 'reviewState']
		),
		run: async (caller, input) => withPortalVisitor(caller, input, (visitor) => markPart(caller, visitor, input))
	},
	{
		name: 'confirm_company_context',
		area: 'support',
		audience: 'everyone',
		isWrite: true,
		summary: 'for a client contact: confirm the version of your company context you have checked, once no part is marked not right',
		guidance:
			'Confirm only when the person says so: confirming tells Your Business Today this is their business as it is, and ' +
			'the services it shows they need are raised from it. A revised version needs confirming again.',
		inputSchema: objectSchema({ clientId: clientIdField, versionNumber: versionNumberField }, ['versionNumber']),
		run: async (caller, input) => withPortalVisitor(caller, input, (visitor) => confirmContext(caller, visitor, input))
	}
];

async function readContext(visitor: PortalVisitor): Promise<string> {
	const standing = describeVisitorStanding(visitor);
	const reading = await readCompanyContextOfClient(visitor.clientId);
	if (reading === null) return `${standing} ${noContextRecordedYet}`;
	const { context, changes, confirmation } = reading;
	return `${standing}\n\n${describeCompanyContext(visitor.organisationName, context, changes, confirmation)}`;
}

async function markPart(caller: McpCaller, visitor: PortalVisitor, input: Record<string, unknown>): Promise<string> {
	const mark = validatePartMarkValues(input);
	if (isRefusal(mark)) return mark.refusal;
	const refusal = await markContextPart({ clientId: visitor.clientId, accountId: caller.accountId }, mark);
	if (refusal !== null) return refusal.refusal;
	const asMarked = mark.reviewState === reviewStates.right ? 'right' : `not right: ${mark.whatIsWrong}`;
	return `Marked ${mark.partKey} ${asMarked} on version ${mark.versionNumber} of ${visitor.organisationName}'s company context.`;
}

async function confirmContext(caller: McpCaller, visitor: PortalVisitor, input: Record<string, unknown>): Promise<string> {
	const versionNumber = readVersionNumber(readText(input, 'versionNumber'));
	if (isRefused(versionNumber)) return versionNumber.refusal;
	const confirmer = { clientId: visitor.clientId, accountId: caller.accountId, organisationName: visitor.organisationName, siteOrigin: companyDetails.websiteUrl };
	const refusal = await confirmCompanyContext(confirmer, versionNumber);
	if (refusal !== null) return refusal.refusal;
	return `Version ${versionNumber} of ${visitor.organisationName}'s company context is confirmed, and Your Business Today has been told.`;
}
