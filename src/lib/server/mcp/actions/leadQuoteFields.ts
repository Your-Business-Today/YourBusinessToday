import { feeBases, leadQuoteLimits as limits } from '$lib/data/leadQuoteRules';
import { objectSchema, textField } from '../actionTypes';

const lineSchema = objectSchema(
	{
		name: textField(`The stage or service, such as "Build stage 1: Calling list", at most ${limits.longestLineName} characters`),
		delivers: textField(`What they get from it, at most ${limits.longestDelivers} characters`),
		timing: textField(`When, such as "Live 2 to 4 weeks after the order", at most ${limits.longestTiming} characters`),
		feeBasis: { type: 'string', enum: [...feeBases], description: 'fixed (once), monthly (each month) or daily (a day rate)' },
		feeAmount: { type: 'number', description: 'The fee in pounds, such as 2500; leave it out when it is not priced yet' },
		feeNote: textField(`A note on the fee, such as "Priced before it starts"; needed when there is no amount; at most ${limits.longestFeeNote} characters`)
	},
	['name', 'feeBasis']
);

export const leadQuoteFields = {
	clientId: textField('The lead, as list_clients gives its id'),
	title: textField(`The quote's title, at most ${limits.longestTitle} characters`),
	preparedOn: textField('The day it was prepared, as YYYY-MM-DD'),
	validUntil: textField('The last day it stands, as YYYY-MM-DD; leave it out when it has none'),
	introduction: textField(`A short introduction, at most ${limits.longestIntroduction} characters`),
	terms: textField(`The terms, at most ${limits.longestTerms} characters`),
	lines: { type: 'array', items: lineSchema, description: `The stages and services in order, 1 to ${limits.mostLines}` }
};

export const leadQuoteVersionField = { type: 'integer', description: 'A version number to read; leave it out for the latest' };
