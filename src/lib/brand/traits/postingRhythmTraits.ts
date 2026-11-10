import { traitsOf } from './traitDefinition';

export const postingRhythmTraits = traitsOf('behaviour', {
	postingDays: {
		kind: 'weekdays',
		label: 'Posting days',
		purpose: 'The days of the week the brand posts, such as Monday, Wednesday and Thursday'
	},
	postingTime: {
		kind: 'timeOfDay',
		label: 'Posting time',
		purpose: 'The time of day its posts go out on the UK clock, such as 19:30'
	},
	postsAWeek: {
		kind: 'wholeNumber',
		label: 'Posts a week',
		purpose: 'How many posts go out in a week; decided on a channel, it is that channel’s own number'
	}
});
