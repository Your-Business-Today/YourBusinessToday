import { watchedKinds, watchedValueHints, watchListLimits } from '$lib/data/news/watchListRules';
import { textField } from '../actionTypes';

export const newsOrganisationField = textField(
	'The organisation whose Business News this is, as list_organisations gives it; Business News must be switched on for it'
);

export const watchedKindField = {
	type: 'string',
	enum: [...watchedKinds],
	description: 'What kind of thing is watched: sector_code, regulator_or_topic, word or company'
};

export const watchedValueField = textField(
	`The thing watched, at most ${watchListLimits.longestValue} characters. ${Object.values(watchedValueHints).join(' ')}`
);

export const watchedLabelField = textField(
	`Leave out, or what the thing is called, such as the company's name, at most ${watchListLimits.longestLabel} characters`
);

export const watchedThingIdField = textField('The id of the watched thing, as list_news_watch_list gives it');
