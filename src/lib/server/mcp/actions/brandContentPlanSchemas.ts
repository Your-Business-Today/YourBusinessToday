import { ContentLimits } from '$lib/brand/content/contentLimits';
import { PlanListing } from '$lib/brand/plan/contentPlan';
import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { postKindField } from './brandContentSchemas';

const { titleCharacters, hookCharacters } = ContentLimits;

const plannedForField = textField(
	'The day and time it goes out, as an ISO date and time with its zone, such as 2026-12-01T09:00:00Z'
);

export const readContentPlanSchema = objectSchema(
	{
		organisationId: organisationIdField,
		month: textField('The month as YYYY-MM, such as 2026-11 — leave out for this month on the UK clock')
	},
	['organisationId']
);

export const planContentIdeaSchema = objectSchema(
	{
		organisationId: organisationIdField,
		medium: textField('The medium the piece is for, such as image.post.facebook, as read_brand_catalogue lists'),
		kind: postKindField,
		title: textField(`A working title for the idea, at most ${titleCharacters} characters`),
		hook: textField(`Its opening line, at most ${hookCharacters} characters, if there is one yet`),
		plannedFor: plannedForField
	},
	['organisationId', 'medium', 'kind', 'title', 'plannedFor']
);

export const moveContentToDaySchema = objectSchema(
	{
		organisationId: organisationIdField,
		contentPieceId: textField('The piece’s id, as read_content_plan or list_content gives it'),
		plannedFor: plannedForField
	},
	['organisationId', 'contentPieceId', 'plannedFor']
);

const pieceAsShownSchema = objectSchema(
	{
		contentPieceId: textField('The piece’s id, as read_content_plan gives it under Waiting for approval'),
		updatedAt: textField('When the piece was last changed, exactly as read_content_plan gave it, so only what was read is approved')
	},
	['contentPieceId', 'updatedAt']
);

export const approveContentMonthSchema = objectSchema(
	{
		organisationId: organisationIdField,
		month: textField('The month the pieces go out in, as YYYY-MM, such as 2026-12'),
		pieces: {
			type: 'array',
			items: pieceAsShownSchema,
			description: `Every piece the client was shown and approves, at most ${PlanListing.mostPieces}`
		}
	},
	['organisationId', 'month', 'pieces']
);
