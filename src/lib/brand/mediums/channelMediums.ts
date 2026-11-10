import type { MediumDefinition } from './mediumDefinition';

const liveActions = ['goLive', 'attend'];

export const channelMediums: MediumDefinition[] = [
	{ path: 'video.short', label: 'Short-form video' },
	{
		path: 'video.short.tiktok',
		label: 'TikTok',
		addsActions: ['stitch', 'duet', 'createWithUs', ...liveActions]
	},
	{ path: 'video.short.reels', label: 'Instagram Reels', addsActions: ['duet', 'createWithUs', ...liveActions] },
	{ path: 'video.short.shorts', label: 'YouTube Shorts', addsActions: ['stitch', 'createWithUs'] },
	{ path: 'video.long', label: 'Long-form video' },
	{ path: 'video.long.youtube', label: 'YouTube', addsActions: [...liveActions, 'signUp'] },
	{ path: 'image.post', label: 'Image post' },
	{ path: 'image.post.instagram', label: 'Instagram post' },
	{ path: 'image.post.linkedin', label: 'LinkedIn image post' },
	{ path: 'image.story', label: 'Story' },
	{ path: 'image.carousel', label: 'Carousel' },
	{ path: 'text.post', label: 'Text post' },
	{ path: 'text.post.x', label: 'X post' },
	{ path: 'text.post.linkedin', label: 'LinkedIn post' },
	{
		path: 'text.email',
		label: 'Email',
		facets: ['look', 'voice', 'behaviour', 'response', 'audience'],
		actions: ['sendNewsletter', 'reply', 'clickThrough', 'replyToUs', 'signUp', 'purchase']
	},
	{ path: 'audio.podcast', label: 'Podcast' },
	{ path: 'web.site', label: 'Website' },
	{ path: 'web.landing', label: 'Landing page' }
];
