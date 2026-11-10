import { objectSchema, textField } from '../actionTypes';
import { boardDecisionLimits } from '$lib/data/boardroomDecisionRules';
import { allDecisionAgreements, allDecisionAnswers } from '$lib/data/boardroomDecision';
import { organisationIdField } from './organisationDetailsFields';

const { longestReason, longestArticlesReference, smallestQuorum, largestQuorum } = boardDecisionLimits;

export const answerDecisionSchema = objectSchema(
	{
		organisationId: organisationIdField,
		meetingId: textField('The meeting id, as list_board_meetings gives it'),
		itemNumber: { type: 'integer', minimum: 1, description: 'The agenda item the decision is on, by its number as read_board_meeting gives it now' },
		answer: { type: 'string', enum: allDecisionAnswers, description: 'Your director’s own answer, in their words to you now: agrees, disagrees or abstains' },
		reason: { type: 'string', maxLength: longestReason, description: `Your director’s own reason, if they gave one, at most ${longestReason} characters` }
	},
	['organisationId', 'meetingId', 'itemNumber', 'answer']
);

export const recordRuleSchema = objectSchema(
	{
		organisationId: organisationIdField,
		quorum: {
			type: 'integer',
			minimum: smallestQuorum,
			maximum: largestQuorum,
			description: 'How many directors must take part for a decision to carry, as the company’s articles fix it'
		},
		agreement: {
			type: 'string',
			enum: allDecisionAgreements,
			description: 'majority: more of the directors taking part for it than against; unanimous: every director taking part agrees'
		},
		chairHasCastingVote: { type: 'boolean', description: 'Whether the chair has a casting vote when the votes are equal' },
		articlesReference: {
			type: 'string',
			maxLength: longestArticlesReference,
			description: `Where the company’s own articles say this, such as "Articles 9 to 12, adopted 3 March 2024", at most ${longestArticlesReference} characters`
		}
	},
	['organisationId', 'quorum', 'agreement', 'chairHasCastingVote', 'articlesReference']
);
