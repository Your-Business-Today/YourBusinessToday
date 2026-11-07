import { placeCamera, type OrbitOffset } from './cameraPath';
import { createAssistantPhone } from './assistantPhone';
import { createBrandMark } from './brandMark';
import { createDustField } from './dustField';
import { createGlowTexture } from './glowTexture';
import { createLaunchNetwork } from './launchNetwork';
import { createNoiseFragments } from './noiseFragments';
import { loadPromoFonts } from './promoFonts';
import { loadPortalScreens, createPortalWall } from './portalWall';
import { readPromoPalette } from './promoPalette';
import { createPromoStage } from './promoStage';
import { createSignalDot } from './signalDot';
import { createTaskBoard } from './taskBoard';
import { createTubeMap } from './tubeMap';

export type PromoScene = {
	renderAt: (seconds: number, orbit: OrbitOffset) => void;
	resize: (width: number, height: number, pixelRatio: number) => void;
	dispose: () => void;
};

type ScenePiece = { update: (seconds: number) => void };

/** Builds the whole film into a canvas; renderAt draws any moment of it, so it can be played, scrubbed or filmed. */
export async function createPromoScene(canvas: HTMLCanvasElement, themeElement: Element): Promise<PromoScene> {
	const [screens] = await Promise.all([loadPortalScreens(), loadPromoFonts()]);
	const palette = readPromoPalette(themeElement);
	const glow = createGlowTexture();
	const stage = createPromoStage(canvas, palette);
	const { scene, camera } = stage;
	const pieces: ScenePiece[] = [
		createDustField(scene, palette),
		createSignalDot(scene, palette),
		createNoiseFragments(scene, palette),
		createTubeMap(scene, palette),
		createTaskBoard(scene, palette),
		createPortalWall(scene, palette, screens, glow),
		createAssistantPhone(scene, palette),
		createLaunchNetwork(scene, palette, glow),
		createBrandMark(scene, palette)
	];
	const renderAt = (seconds: number, orbit: OrbitOffset) => {
		pieces.forEach((piece) => piece.update(seconds));
		placeCamera(camera, seconds, orbit);
		stage.render();
	};
	return { renderAt, resize: stage.resize, dispose: stage.dispose };
}
