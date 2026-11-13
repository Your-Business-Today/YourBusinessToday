import { describe, expect, it } from 'vitest';
import { describeYbtCommands, ybtCommands, ybtCommandsDoctrine } from './ybtCommands';

const tagShape = /^ybt-[a-z]+(-[a-z]+)*$/;

describe('the /ybt- command family', () => {
	it('names every command as a tag a person can type, each once', () => {
		const names = ybtCommands.map((command) => command.name);
		expect(names.every((name) => tagShape.test(name))).toBe(true);
		expect(new Set(names).size).toBe(names.length);
		expect(names).toEqual(['ybt-chat', 'ybt-summary', 'ybt-outstanding', 'ybt-bugs', 'ybt-chase', 'ybt-project', 'ybt-raise', 'ybt-tie-off', 'ybt-help']);
	});

	it('teaches the typed commands in the current context, so they work in any chat', () => {
		for (const command of ybtCommands) expect(ybtCommandsDoctrine).toContain(`/${command.name}`);
		expect(ybtCommandsDoctrine).toContain('do what it asks');
	});

	it('lists every other command in the help, the tag then what it does', () => {
		const help = ybtCommands.find((command) => command.name === 'ybt-help');
		const helpText = help?.text ?? '';
		expect(helpText).toContain(describeYbtCommands());
		expect(describeYbtCommands()).toContain('/ybt-summary — What is new for you since you last spoke');
		expect(describeYbtCommands()).not.toContain('/ybt-help');
		expect(helpText).toContain('/ybt-help — this list.');
	});

	it('gives each command a title, a description and the text that asks its Claude to do one thing', () => {
		for (const { title, description, text } of ybtCommands) {
			expect(title).toMatch(/^YBT /);
			expect(description.length).toBeGreaterThan(20);
			expect(text.length).toBeGreaterThan(40);
		}
	});
});
