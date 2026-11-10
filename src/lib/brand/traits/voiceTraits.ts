import { traitsOf } from './traitDefinition';

export const voiceTraits = traitsOf('voice', {
	tone: { kind: 'phrase', label: 'Tone', purpose: 'How the brand sounds in a sentence' },
	personality: { kind: 'phraseList', label: 'Personality', purpose: 'The words that describe the brand as a person' },
	person: { kind: 'choice', label: 'Speaks as', purpose: 'Who is talking', choices: ['I', 'we', 'the brand name'] },
	wordsToUse: { kind: 'phraseList', label: 'Words to use', purpose: 'Words and phrases that are the brand' },
	wordsToAvoid: { kind: 'phraseList', label: 'Words to avoid', purpose: 'Words the brand never says' },
	topicsToAvoid: { kind: 'phraseList', label: 'Topics to avoid', purpose: 'Subjects the brand stays out of' },
	greeting: { kind: 'phrase', label: 'Greeting', purpose: 'How the brand says hello' },
	signOff: { kind: 'phrase', label: 'Sign-off', purpose: 'How the brand says goodbye' },
	sentenceLength: { kind: 'choice', label: 'Sentence length', purpose: 'How long its sentences run', choices: ['short', 'medium', 'long'] },
	emoji: { kind: 'choice', label: 'Emoji', purpose: 'Whether and how it uses emoji', choices: ['never', 'sparingly', 'freely'] },
	hashtags: { kind: 'phraseList', label: 'Hashtags', purpose: 'The brand’s own hashtags' }
});
