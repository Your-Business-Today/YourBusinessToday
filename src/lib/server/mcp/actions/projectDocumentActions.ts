import { organisationDocumentHome, organisationDocumentNames, productDocumentHome, productDocumentNames } from './documentHomes';
import {
	addDocumentAction,
	deleteDocumentAction,
	listDocumentsAction,
	readDocumentAction,
	recordDocumentAction,
	updateDocumentAction
} from './documentActionMakers';

/** The connector actions on a product's documents. */
export const projectDocumentActions = [
	listDocumentsAction(productDocumentNames.list, productDocumentHome),
	readDocumentAction(productDocumentNames.read, productDocumentHome),
	addDocumentAction(productDocumentNames.add, productDocumentHome),
	recordDocumentAction(productDocumentNames.record, productDocumentHome),
	updateDocumentAction(productDocumentNames.update, productDocumentHome),
	deleteDocumentAction(productDocumentNames.remove, productDocumentHome)
];

/** The connector actions on an organisation's own documents. */
export const organisationDocumentActions = [
	listDocumentsAction(organisationDocumentNames.list, organisationDocumentHome),
	readDocumentAction(organisationDocumentNames.read, organisationDocumentHome),
	addDocumentAction(organisationDocumentNames.add, organisationDocumentHome),
	recordDocumentAction(organisationDocumentNames.record, organisationDocumentHome),
	updateDocumentAction(organisationDocumentNames.update, organisationDocumentHome),
	deleteDocumentAction(organisationDocumentNames.remove, organisationDocumentHome)
];
