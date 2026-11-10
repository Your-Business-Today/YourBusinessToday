import { facetKeys } from '../facets';
import type { MediumDefinition } from './mediumDefinition';

const socialActions = ['publish', 'reply', 'react', 'pinComment', 'repost', 'collaborate'];
const socialResponses = ['follow', 'like', 'comment', 'share', 'save', 'clickThrough'];
const promotionActions = ['runGiveaway', 'askQuestion'];

export const familyMediums: MediumDefinition[] = [
	{
		path: 'video',
		label: 'Video',
		facets: [...facetKeys],
		actions: [...socialActions, ...promotionActions, ...socialResponses, 'purchase']
	},
	{
		path: 'image',
		label: 'Image',
		facets: ['look', 'voice', 'behaviour', 'response', 'audience'],
		actions: [...socialActions, ...promotionActions, ...socialResponses, 'purchase']
	},
	{
		path: 'text',
		label: 'Text',
		facets: ['voice', 'behaviour', 'response', 'audience'],
		actions: ['publish', 'reply', 'react', 'repost', 'askQuestion', ...socialResponses]
	},
	{
		path: 'audio',
		label: 'Audio',
		facets: ['sound', 'voice', 'behaviour', 'response', 'audience'],
		actions: ['publish', 'askQuestion', 'follow', 'share', 'clickThrough', 'signUp']
	},
	{
		path: 'web',
		label: 'Web',
		facets: ['look', 'motion', 'voice', 'behaviour', 'response', 'audience'],
		actions: ['publish', 'reply', 'askQuestion', 'follow', 'clickThrough', 'signUp', 'purchase']
	}
];
