import { describe, expect, it } from 'vitest';
import { businessBrainChatbotLimits } from '$lib/data/businessBrainChatbotRules';
import {
	noPartsToRead,
	nothingToChange,
	validateBusinessBrainChatbotChange,
	validateBusinessBrainChatbotMade
} from './validateBusinessBrainChatbot';

const chatbotId = '00000000-0000-0000-0000-0000000000b0';
const { longestName, longestPurpose, longestEmail, mostPeopleAtOnce } = businessBrainChatbotLimits;

describe('a chatbot as a manager makes it', () => {
	it('keeps its name, its parts once each and its people in lower case', () => {
		const made = { name: ' Site team ', parts: ['process', 'process', 'people'], people: ['Stuart@Example.com'] };
		expect(validateBusinessBrainChatbotMade(made)).toEqual({ name: 'Site team', purpose: '', parts: ['process', 'people'], people: ['stuart@example.com'] });
	});

	it('keeps what it is for, and refuses a purpose longer than its column', () => {
		const made = { name: 'Sales brain', purpose: ' Answers the sales team ', parts: ['process'] };
		expect(validateBusinessBrainChatbotMade(made)).toMatchObject({ purpose: 'Answers the sales team' });
		const longPurpose = 'p'.repeat(longestPurpose + 1);
		expect(validateBusinessBrainChatbotMade({ ...made, purpose: longPurpose })).toContain(`at most ${longestPurpose}`);
	});

	it('refuses a name longer than its column, never cutting it short', () => {
		const longName = 'n'.repeat(longestName + 1);
		expect(validateBusinessBrainChatbotMade({ name: longName, parts: ['process'] })).toContain(`at most ${longestName}`);
	});

	it('refuses a chatbot that reads nothing, and a part the brain does not have', () => {
		expect(validateBusinessBrainChatbotMade({ name: 'Site team', parts: [] })).toBe(noPartsToRead);
		expect(validateBusinessBrainChatbotMade({ name: 'Site team', parts: ['finance'] })).toContain('"finance" in parts is not a part');
		expect(validateBusinessBrainChatbotMade({ name: 'Site team', parts: 'process' })).toContain('is a list');
	});

	it('refuses a person who is not an email address that fits its column', () => {
		expect(validateBusinessBrainChatbotMade({ name: 'Site team', parts: ['process'], people: ['Stuart'] })).toContain('"stuart" in people');
		const longEmail = `${'s'.repeat(longestEmail)}@example.com`;
		expect(validateBusinessBrainChatbotMade({ name: 'Site team', parts: ['process'], people: [longEmail] })).toContain(`at most ${longestEmail}`);
	});

	it('refuses more people at once than it takes', () => {
		const crowd = Array.from({ length: mostPeopleAtOnce + 1 }, (_, position) => `person${position}@example.com`);
		expect(validateBusinessBrainChatbotMade({ name: 'Site team', parts: ['process'], people: crowd })).toContain(`at most ${mostPeopleAtOnce}`);
	});
});

describe('a change to a chatbot', () => {
	it('keeps what is added and taken away', () => {
		const change = { chatbotId, addParts: ['expertise'], removePeople: ['Nigel@Example.com'] };
		expect(validateBusinessBrainChatbotChange(change)).toEqual({
			chatbotId,
			purpose: null,
			addParts: ['expertise'],
			removeParts: [],
			addPeople: [],
			removePeople: ['nigel@example.com']
		});
	});

	it('takes a new purpose alone as a change, an empty one included', () => {
		expect(validateBusinessBrainChatbotChange({ chatbotId, purpose: 'Answers the site team' })).toMatchObject({ purpose: 'Answers the site team' });
		expect(validateBusinessBrainChatbotChange({ chatbotId, purpose: '' })).toMatchObject({ purpose: '' });
		expect(validateBusinessBrainChatbotChange({ chatbotId, purpose: 'p'.repeat(longestPurpose + 1) })).toContain(`at most ${longestPurpose}`);
	});

	it('refuses a change that names nothing, a chatbot that is not an id, and a part both added and taken away', () => {
		expect(validateBusinessBrainChatbotChange({ chatbotId })).toBe(nothingToChange);
		expect(validateBusinessBrainChatbotChange({ chatbotId: 'site-team', addParts: ['process'] })).toContain('chatbotId must be an id');
		expect(validateBusinessBrainChatbotChange({ chatbotId, addParts: ['process'], removeParts: ['process'] })).toContain('both added and taken away');
	});
});
