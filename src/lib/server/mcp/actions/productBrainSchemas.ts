import { businessBrainPartKinds } from '$lib/data/businessBrainRules';
import { objectSchema, textField } from '../actionTypes';
import { organisationField, pageToReadField, partToListField, revisionToReadField, searchField } from './businessBrainSchemas';

export const productField = textField('The product, as list_projects gives its id');

const partListField = (description: string) => ({
	type: 'array',
	items: { type: 'string', enum: [...businessBrainPartKinds] },
	description
});

export const changeProductBrainSchema = objectSchema(
	{
		organisationId: organisationField,
		projectId: productField,
		addParts: partListField("Parts of the organisation's brain to tie to the product"),
		removeParts: partListField('Parts of the brain to untie from the product')
	},
	['organisationId', 'projectId']
);

export const readProductBrainIndexSchema = objectSchema({ projectId: productField, part: partToListField }, ['projectId']);

export const searchProductBrainSchema = objectSchema({ projectId: productField, search: searchField }, ['projectId', 'search']);

export const readProductBrainPageSchema = objectSchema(
	{ projectId: productField, pageId: pageToReadField, revisionId: revisionToReadField },
	['projectId', 'pageId']
);
