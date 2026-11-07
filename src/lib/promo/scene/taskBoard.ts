import { Group, type Scene } from 'three';
import { boardStory } from '../boardStory';
import { beatsInto } from '../promoTimeline';
import { progressBetween, smoothStep } from '../promoMotion';
import { createBoardCard } from './boardCard';
import { createBoardColumns } from './boardColumns';
import { createFadeGroup } from './fadeGroup';
import { createGlowTexture } from './glowTexture';
import type { PromoPalette } from './promoPalette';
import { promoSets } from './promoSets';
import { drawTickBadge } from './tickBadge';

export type TaskBoard = { update: (seconds: number) => void };

const arrival = { startBeat: -3, endBeat: 0.5 };
const departure = { startBeat: 1, endBeat: 3 };
const standing = { drop: 7, lean: 0.9 };

function boardArrivalAt(seconds: number): number {
	return smoothStep(progressBetween(beatsInto('board', seconds), arrival.startBeat, arrival.endBeat));
}

function boardDepartureAt(seconds: number): number {
	return smoothStep(progressBetween(beatsInto('app', seconds), departure.startBeat, departure.endBeat));
}

/** The YourBusinessToday board, standing up out of the dark as the camera arrives, its real tasks moving on to Live. */
export function createTaskBoard(scene: Scene, palette: PromoPalette): TaskBoard {
	const board = new Group();
	const fades = createFadeGroup();
	const columns = createBoardColumns(board, palette, fades);
	const look = { palette, glow: createGlowTexture(), tick: drawTickBadge(palette), board };
	const cards = boardStory.map((_, index) => createBoardCard(index, look));
	const { x, y, z } = promoSets.board;
	scene.add(board);
	const update = (seconds: number) => {
		const arrived = boardArrivalAt(seconds);
		const presence = arrived * (1 - boardDepartureAt(seconds));
		const isShown = presence > 0;
		board.visible = isShown;
		if (!isShown) return;
		const lying = 1 - arrived;
		board.position.set(x, y - lying * standing.drop, z);
		board.rotation.set(-lying * standing.lean, 0, 0);
		fades.setPresence(presence);
		const boardBeats = beatsInto('board', seconds);
		columns.update(boardBeats);
		cards.forEach((card) => card.update(boardBeats, presence));
	};
	return { update };
}
