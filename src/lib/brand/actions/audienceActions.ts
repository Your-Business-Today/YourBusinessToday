import type { BrandAction } from './brandAction';

const audienceDoes = (key: string, label: string, description: string): BrandAction => ({
	key,
	actor: 'audience',
	label,
	description
});

export const audienceActions: BrandAction[] = [
	audienceDoes('follow', 'Follow', 'Follow or subscribe to the brand'),
	audienceDoes('like', 'Like', 'Like or react to a post'),
	audienceDoes('comment', 'Comment', 'Say something under a post'),
	audienceDoes('share', 'Share', 'Send a post to someone else'),
	audienceDoes('save', 'Save', 'Keep a post to come back to'),
	audienceDoes('clickThrough', 'Click through', 'Follow a link to the brand’s site'),
	audienceDoes('signUp', 'Sign up', 'Join a list, a trial or an event'),
	audienceDoes('purchase', 'Buy', 'Buy something'),
	audienceDoes('createWithUs', 'Create with us', 'Stitch, duet or use the brand’s sound'),
	audienceDoes('replyToUs', 'Reply to us', 'Answer an email or a message'),
	audienceDoes('attend', 'Attend', 'Join a live or an event')
];
