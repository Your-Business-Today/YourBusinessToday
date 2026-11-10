import type { BrandAction } from './brandAction';

const brandDoes = (key: string, label: string, description: string): BrandAction => ({
	key,
	actor: 'brand',
	label,
	description
});

export const brandActions: BrandAction[] = [
	brandDoes('publish', 'Publish', 'Post original content'),
	brandDoes('reply', 'Reply', 'Answer comments and messages'),
	brandDoes('react', 'React', 'Like or react to what people say'),
	brandDoes('pinComment', 'Pin a comment', 'Pin a comment to the top of a post'),
	brandDoes('stitch', 'Stitch', 'Build on a clip of someone else’s video'),
	brandDoes('duet', 'Duet', 'Play alongside someone else’s video'),
	brandDoes('repost', 'Repost', 'Share what the audience made'),
	brandDoes('collaborate', 'Collaborate', 'Make content with another creator or brand'),
	brandDoes('goLive', 'Go live', 'Broadcast live'),
	brandDoes('runGiveaway', 'Run a giveaway', 'Run a giveaway or competition'),
	brandDoes('askQuestion', 'Ask a question', 'Ask the audience a question or run a poll'),
	brandDoes('sendNewsletter', 'Send a newsletter', 'Email the people who subscribed')
];
