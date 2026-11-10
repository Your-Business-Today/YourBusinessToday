import { traitsOf } from './traitDefinition';

/** Where a channel's link goes: in the caption itself, or in the profile's bio with the caption pointing to it. */
export const LinkPlacements = { caption: 'in the caption', bio: 'in the bio' } as const;

export const captionTraits = traitsOf('voice', {
	fewestHashtags: {
		kind: 'wholeNumber',
		label: 'Fewest hashtags',
		purpose: 'The fewest hashtags a caption carries; decided on a channel, such as three on Instagram, it is that channel’s own'
	},
	mostHashtags: {
		kind: 'wholeNumber',
		label: 'Most hashtags',
		purpose: 'The most hashtags a caption carries; decided on a channel, such as two on Facebook, it is that channel’s own'
	},
	linkPlacement: {
		kind: 'choice',
		label: 'Where the link goes',
		purpose: 'Whether the web address goes in the caption, or in the bio with the caption saying so, as on Instagram',
		choices: Object.values(LinkPlacements)
	}
});
