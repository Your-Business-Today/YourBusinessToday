import { AdditiveBlending, Group, Mesh, MeshBasicMaterial, PlaneGeometry, type Texture } from 'three';
import { cardPlacements } from '../boardLayout';
import { boardStory } from '../boardStory';
import { boardTasks } from '../promoBoard';
import { easeOutBack, progressBetween } from '../promoMotion';
import { drawCardFace } from './boardCardFace';
import { cardPoseAt, liveSinceBeat } from './boardCardPose';
import { boardShape } from './boardShape';
import type { PromoPalette } from './promoPalette';

export type BoardCard = { update: (boardBeats: number, presence: number) => void };

export type CardLook = { palette: PromoPalette; glow: Texture; tick: Texture; board: Group };

type Landing = { flash: MeshBasicMaterial; tick: Mesh; tickMaterial: MeshBasicMaterial };

const flash = { width: 14, height: 8.5, decayPerBeat: 1.3, depth: -0.05 };
const badge = { size: 1.15, popBeats: 0.6, depth: 0.06, inset: -0.1 };
const tiltPerLift = 0.07;

function createLanding(card: Group, look: CardLook): Landing {
	const { palette, glow: glowTexture, tick: tickTexture } = look;
	const flashLook = { map: glowTexture, color: palette.go, blending: AdditiveBlending, depthWrite: false };
	const flashMaterial = new MeshBasicMaterial({ ...flashLook, transparent: true });
	const glow = new Mesh(new PlaneGeometry(flash.width, flash.height), flashMaterial);
	glow.position.setZ(flash.depth);
	const tickMaterial = new MeshBasicMaterial({ map: tickTexture, transparent: true });
	const tick = new Mesh(new PlaneGeometry(badge.size, badge.size), tickMaterial);
	const corner = { x: boardShape.cardWidth / 2 - badge.inset, y: boardShape.cardHeight / 2 - badge.inset };
	tick.position.set(corner.x, corner.y, badge.depth);
	card.add(glow, tick);
	return { flash: flashMaterial, tick, tickMaterial };
}

function showLanding(landing: Landing, beatsLive: number, opacity: number): void {
	const { flash: flashMaterial, tick, tickMaterial } = landing;
	const hasLanded = beatsLive >= 0;
	const flashStrength = hasLanded ? Math.exp(-beatsLive * flash.decayPerBeat) : 0;
	flashMaterial.opacity = flashStrength * opacity;
	const popped = easeOutBack(progressBetween(beatsLive, 0, badge.popBeats));
	tick.scale.setScalar(Math.max(0, popped));
	tick.visible = hasLanded;
	tickMaterial.opacity = opacity;
}

/** One task on the board: it rides its placements, and flashes green and takes a tick when it goes live. */
export function createBoardCard(storyIndex: number, look: CardLook): BoardCard {
	const { task } = boardStory[storyIndex];
	const placements = cardPlacements[storyIndex];
	const liveSince = liveSinceBeat(placements);
	const faceMaterial = new MeshBasicMaterial({ map: drawCardFace(boardTasks[task], look.palette), transparent: true });
	const card = new Group();
	card.add(new Mesh(new PlaneGeometry(boardShape.cardWidth, boardShape.cardHeight), faceMaterial));
	const landing = createLanding(card, look);
	look.board.add(card);
	const update = (boardBeats: number, presence: number) => {
		const pose = cardPoseAt(placements, boardBeats);
		const opacity = pose.visibility * presence;
		card.visible = opacity > 0;
		card.position.set(pose.x, pose.y, pose.lift);
		card.rotation.set(0, -pose.lift * tiltPerLift, (pose.lift * tiltPerLift) / 2);
		faceMaterial.opacity = opacity;
		showLanding(landing, boardBeats - liveSince, opacity);
	};
	return { update };
}
