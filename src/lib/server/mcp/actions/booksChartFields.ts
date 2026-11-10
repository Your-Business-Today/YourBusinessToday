import { accountTypeList } from '$lib/data/books/chartRules';
import { textField } from '../actionTypes';

export const isArchivedField = { type: 'boolean', description: 'True to archive it, false to bring it back' };

export const newLedgerAccountFields = {
	code: textField('The account code, such as 4010, not already in the chart; give it as the person said it'),
	name: textField('What the account is called, in the words the person gave'),
	accountType: textField(`What kind of account it is: one of ${accountTypeList}`)
};

export const ledgerAccountIdField = textField('The account, by its id as read_chart_of_accounts gives it');

export const costCentreNameField = textField('What the cost centre is called, in the words the person gave');

export const costCentreIdField = textField('The cost centre, by its id as list_cost_centres gives it');

export const archiveVerdict = (isArchived: boolean): string => (isArchived ? 'is archived: nothing new posts to it' : 'is brought back and takes new lines');

export const archivingKeepsHistory =
	'Archiving keeps everything already posted and only stops new lines; bring it back the same way. Ask the person ' +
	'before archiving, naming it as the books hold it.';
