import { deleteBankRule, findBankRules } from '$lib/server/books/bankRules';
import { findRuleTargetNames } from '$lib/server/books/bankRuleNames';
import { setBankRuleAndApply } from '$lib/server/books/bankRuleRuns';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { bankRuleFields, bankRuleIdField } from './booksBankRuleFields';
import { describeBankRule, describeBankRuleList, describeBankRuleSet } from './describeBankRules';
import type { McpAction } from '../actionTypes';

const setARuleOnlyForWhatIsAlwaysTheSame =
	'Set a rule only when the person says every line from that counterparty is the same thing, such as a software subscription ' +
	'or a director topping up their loan account. Never for a customer: their payments are matched to invoices with match_bank_line.';

const readTheRulesFirst = 'List the rules before setting one, so the person hears what the books do by themselves already.';

export const booksBankRuleActions: McpAction[] = [
	moduleAction('books', {
		name: 'list_bank_rules',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "list an organisation's bank rules: what a bank line from each counterparty always is, with the id of each",
		guidance: readTheRulesFirst,
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) => {
			const rules = await findBankRules(caller.supabase, organisation.id);
			const names = await findRuleTargetNames(caller.supabase, organisation.id, rules);
			return describeBankRuleList(organisation.name, rules, names);
		}
	}),
	moduleAction('books', {
		name: 'set_bank_rule',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "keep what a bank line from one counterparty always is, a cost or another account, replacing the rule for the same counterparty and direction",
		guidance: setARuleOnlyForWhatIsAlwaysTheSame,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...bankRuleFields }, ['organisationId', 'counterparty', 'direction', 'applyNow']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const set = await setBankRuleAndApply(caller.supabase, organisation.id, { accountId: caller.accountId }, input);
				const rules = set.replaced === null ? [set.rule] : [set.rule, set.replaced];
				const names = await findRuleTargetNames(caller.supabase, organisation.id, rules);
				return describeBankRuleSet(organisation.name, set, names);
			})
	}),
	moduleAction('books', {
		name: 'delete_bank_rule',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "take one of an organisation's bank rules out of its books; the lines it matched stay matched",
		guidance: 'Read the rule back to the person from list_bank_rules before taking it out.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField, bankRuleId: bankRuleIdField }, ['organisationId', 'bankRuleId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.deleting, async () => {
				const rule = await deleteBankRule(caller.supabase, organisation.id, input.bankRuleId);
				const names = await findRuleTargetNames(caller.supabase, organisation.id, [rule]);
				return `Took the rule out of ${organisation.name}'s books: ${describeBankRule(rule, names)}. The lines it matched stay matched.`;
			})
	})
];
