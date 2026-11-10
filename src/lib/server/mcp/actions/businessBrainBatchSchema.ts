import { businessBrainFilingLimits } from '$lib/data/businessBrainRules';
import { newPageFields, newPageRequiredFields, organisationField, sourceNamingFields } from './businessBrainSchemas';
import { objectSchema } from '../actionTypes';

const { mostPagesPerCall } = businessBrainFilingLimits;

const pageEntry = objectSchema(newPageFields, newPageRequiredFields);

export const fileBusinessBrainPagesSchema = objectSchema(
	{
		organisationId: organisationField,
		pages: {
			type: 'array',
			items: pageEntry,
			description:
				`The pages to file, one subject each, at most ${mostPagesPerCall}. ` +
				'A page that names no source of its own takes the source named beside pages.'
		},
		...sourceNamingFields
	},
	['organisationId', 'pages']
);
