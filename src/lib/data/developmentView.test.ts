import { describe, expect, it } from 'vitest';
import { developmentViewOf, developmentViews } from './developmentView';

describe('developmentViewOf', () => {
	it('shows the scrum board only when the address names it', () => {
		expect(developmentViewOf(new URL('https://portal.example/projects/a?view=board'))).toBe(developmentViews.board);
		expect(developmentViewOf(new URL('https://portal.example/projects/a?department=bugs'))).toBe(developmentViews.backlog);
	});
});
