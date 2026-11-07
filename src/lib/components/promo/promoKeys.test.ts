import { describe, expect, it, vi } from 'vitest';
import { promoChapters, promoDurationSeconds } from '$lib/promo/promoTimeline';
import { keyActionFor } from './promoKeys';

function playerActions() {
	return { toggle: vi.fn(), seek: vi.fn(), toggleSound: vi.fn() };
}

const [signal, noise, map] = promoChapters;
const brand = promoChapters[promoChapters.length - 1];
const wellIntoAChapter = 3;
const justAfterItStarts = 0.5;

describe('the player keys', () => {
	it('plays and pauses on space and K', () => {
		const actions = playerActions();
		keyActionFor(' ', 0, actions)?.();
		keyActionFor('k', 0, actions)?.();
		expect(actions.toggle).toHaveBeenCalledTimes(2);
	});

	it('turns the sound on and off on M', () => {
		const actions = playerActions();
		keyActionFor('m', 0, actions)?.();
		expect(actions.toggleSound).toHaveBeenCalledOnce();
	});

	it('jumps to the next chapter on the right arrow, and to the end from the last one', () => {
		const actions = playerActions();
		keyActionFor('ArrowRight', signal.startSeconds + wellIntoAChapter, actions)?.();
		keyActionFor('ArrowRight', brand.startSeconds + wellIntoAChapter, actions)?.();
		expect(actions.seek).toHaveBeenNthCalledWith(1, noise.startSeconds);
		expect(actions.seek).toHaveBeenNthCalledWith(2, promoDurationSeconds);
	});

	it('goes back to the start of the chapter, or to the one before when it has only just begun', () => {
		const actions = playerActions();
		keyActionFor('ArrowLeft', map.startSeconds + wellIntoAChapter, actions)?.();
		keyActionFor('ArrowLeft', map.startSeconds + justAfterItStarts, actions)?.();
		expect(actions.seek).toHaveBeenNthCalledWith(1, map.startSeconds);
		expect(actions.seek).toHaveBeenNthCalledWith(2, noise.startSeconds);
	});

	it('leaves every other key to the page', () => {
		expect(keyActionFor('Enter', 0, playerActions())).toBeUndefined();
	});
});
