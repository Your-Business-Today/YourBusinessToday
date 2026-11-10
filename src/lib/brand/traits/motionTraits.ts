import { traitsOf } from './traitDefinition';

export const motionTraits = traitsOf('motion', {
	'timing.standard': { kind: 'duration', label: 'Standard duration', purpose: 'How long an ordinary transition takes' },
	'timing.cutRhythm': { kind: 'duration', label: 'Cut rhythm', purpose: 'How long a shot usually holds before the cut' },
	'easing.standard': { kind: 'easing', label: 'Standard easing', purpose: 'How things speed up and settle' },
	'caption.entrance': { kind: 'choice', label: 'Caption entrance', purpose: 'How captions arrive', choices: ['none', 'fade', 'pop', 'slide-up', 'typewriter', 'word-by-word'] },
	'transition.style': { kind: 'choice', label: 'Transition style', purpose: 'How one shot becomes the next', choices: ['cut', 'dissolve', 'whip', 'zoom', 'match-cut'] },
	pacing: { kind: 'choice', label: 'Pacing', purpose: 'The overall energy of the edit', choices: ['calm', 'steady', 'brisk', 'frantic'] }
});
