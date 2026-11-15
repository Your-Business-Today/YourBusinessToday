import type { YbtCommand } from './ybtCommand';

/** The commands of a staff member who sells: they walk the path rule 9 of the working doctrine lays out. */
export const salesCommands: YbtCommand[] = [
	{
		name: 'ybt-prospect',
		title: 'YBT prospect: find me firms to sell to',
		description:
			'Work a territory from its companies to a first approach: the firms with money in the bank, who decides at each, what is known about them and the words to open with.',
		text:
			'Find me firms to sell to. Work a territory as rule 9 of the doctrine says, one step at a time, telling me in a line what each step found before the next. ' +
			'Take the territory I name, or list_patches and ask me which; a place that is not a territory yet is saved with create_patch around its postcode. ' +
			'A territory that holds no companies is filled first: pull_patch_companies until every outcode is pulled, then geocode_register_postcodes until nothing remains. ' +
			'Take the trade and the least cash at bank from what I said, or ask me; then start_cash_screen, carry_on_cash_screen until it says the screen is finished, and read_cash_screen. ' +
			'Show me the passes, the most cash first, and ask which to go after; read_patch_company says what is known about each. ' +
			'For each one I choose: add_patch_company_as_lead, import_company_officers for its directors, then research the company and the one who decides and keep both with save_company_research and save_person_research. ' +
			'Draft the first approach, show it to me and keep it with save_person_approach on my yes, and set the next step and the day it is due with update_person. ' +
			'I send the approach myself: you never send anything to a lead.'
	}
];
