import { traitsOf } from './traitDefinition';

export const soundTraits = traitsOf('sound', {
	'music.genre': { kind: 'phrase', label: 'Music', purpose: 'The kind of music under the brand’s content' },
	'music.energy': { kind: 'choice', label: 'Music energy', purpose: 'How much the music drives the edit', choices: ['low', 'medium', 'high'] },
	'voiceover.character': { kind: 'phrase', label: 'Voiceover', purpose: 'Who the voiceover sounds like' },
	signature: { kind: 'phrase', label: 'Sonic signature', purpose: 'The sound people hear and know is the brand' },
	trendingAudio: { kind: 'choice', label: 'Trending audio', purpose: 'Whether the brand rides trending sounds', choices: ['ride', 'sometimes', 'avoid'] }
});
