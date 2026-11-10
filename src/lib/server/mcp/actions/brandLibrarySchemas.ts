import { objectSchema, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';

export const listBrandLibrarySchema = objectSchema({ organisationId: organisationIdField }, ['organisationId']);

export const readLibraryItemSchema = objectSchema(
	{ organisationId: organisationIdField, itemId: textField('The item, as list_brand_library gives its id') },
	['organisationId', 'itemId']
);
