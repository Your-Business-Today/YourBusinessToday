import { accountTypeList } from '$lib/data/books/chartRules';
import { textField } from '../actionTypes';

export const isArchivedField = { type: 'boolean', description: 'True to archive it, false to bring it back' };

export const newLedgerAccountFields = {
	code: textField('The account code, such as 4010, not already in the chart; give it as the person said it'),
	name: textField('What the account is called, in the words the person gave'),
	accountType: textField(`What kind of account it is: one of ${accountTypeList}`)
};

export const renamedAccountCodeField = textField('The account to rename, by its code as read_chart_of_accounts gives it, such as 6000');

export const newAccountNameField = textField('What the account is to be called, in the words the person gave');

export const renamingKeepsHistory =
	'Read the chart first with read_chart_of_accounts and name the account by its code there; take the new name in ' +
	"the person's words. The code, the type and every line posted stay as they are, and every report reads the new name.";

export const ledgerAccountIdField = textField('The account, by its id as read_chart_of_accounts gives it');

export const costCentreNameField = textField('What the cost centre is called, in the words the person gave');

export const costCentreIdField = textField('The cost centre, by its id as list_cost_centres gives it');

export const archiveVerdict = (isArchived: boolean): string => (isArchived ? 'is archived: nothing new posts to it' : 'is brought back and takes new lines');

export const archivingKeepsHistory =
	'Archiving keeps everything already posted and only stops new lines; bring it back the same way. Ask the person ' +
	'before archiving, naming it as the books hold it.';
