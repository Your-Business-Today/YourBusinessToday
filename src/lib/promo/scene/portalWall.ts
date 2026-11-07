import { AdditiveBlending, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, TextureLoader } from 'three';
import type { Scene, Texture } from 'three';
import { constructionPortalScreens } from '$lib/data/portalScreens';
import { beatsInto } from '../promoTimeline';
import { easeOutCubic, mix, progressBetween, smoothStep } from '../promoMotion';
import { gatheredAt } from './launchGathering';
import type { PromoPalette } from './promoPalette';
import { promoSets } from './promoSets';
import { placeWallScreen, wallScreens, wallShape } from './portalWallLayout';

export type PortalWall = { update: (seconds: number) => void };

type ScreenPanel = { panel: Group; materials: MeshBasicMaterial[] };

const arrival = { firstBeat: -1.5, beatsApart: 0.4, beats: 2.4 };
const stepBack = { fromBeat: 7, toBeat: 9, dimmedTo: 0.55 };
const screenLight = { spread: 1.3, opacity: 0.42, depth: -0.08 };
const screenBrightness = 0.92;
const textureSharpness = 8;

/** Loads the demo portal's screens, so the wall shows the real thing rather than a drawing of it. */
export async function loadPortalScreens(): Promise<Map<string, Texture>> {
	const loader = new TextureLoader();
	const loaded = await Promise.all(constructionPortalScreens.map((screen) => loader.loadAsync(screen.imageUrl)));
	loaded.forEach((texture) => {
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = textureSharpness;
	});
	return new Map(constructionPortalScreens.map((screen, index) => [screen.id, loaded[index]]));
}

function createPanel(texture: Texture | undefined, glow: Texture, palette: PromoPalette): ScreenPanel {
	const face = new MeshBasicMaterial({ map: texture, transparent: true });
	face.color.setScalar(screenBrightness);
	const [victoria] = palette.lines;
	const lightLook = { map: glow, color: victoria, blending: AdditiveBlending, depthWrite: false, transparent: true };
	const light = new MeshBasicMaterial(lightLook);
	const panel = new Group();
	const shine = new Mesh(new PlaneGeometry(wallShape.width * screenLight.spread, wallShape.height * screenLight.spread), light);
	shine.position.setZ(screenLight.depth);
	panel.add(shine, new Mesh(new PlaneGeometry(wallShape.width, wallShape.height), face));
	return { panel, materials: [face, light] };
}

function showPanel({ panel, materials }: ScreenPanel, presence: number): void {
	panel.visible = presence > 0;
	const [face, light] = materials;
	face.opacity = presence;
	light.opacity = presence * screenLight.opacity;
}

/** The portal itself: its pages fly in and lock into a curved wall around the viewer. */
export function createPortalWall(scene: Scene, palette: PromoPalette, screens: Map<string, Texture>, glow: Texture): PortalWall {
	const wall = new Group();
	const panels = wallScreens.map((screen) => createPanel(screens.get(screen.id), glow, palette));
	panels.forEach(({ panel }) => wall.add(panel));
	const { x, y, z } = promoSets.app;
	wall.position.set(x, y, z);
	scene.add(wall);
	const update = (seconds: number) => {
		const appBeats = beatsInto('app', seconds);
		const gathered = gatheredAt(seconds);
		const dimmed = mix(1, stepBack.dimmedTo, smoothStep(progressBetween(appBeats, stepBack.fromBeat, stepBack.toBeat)));
		panels.forEach((screenPanel, rank) => {
			const start = arrival.firstBeat + rank * arrival.beatsApart;
			const arrived = easeOutCubic(progressBetween(appBeats, start, start + arrival.beats));
			placeWallScreen(screenPanel.panel, wallScreens[rank], arrived, gathered);
			showPanel(screenPanel, smoothStep(arrived) * dimmed * (1 - gathered));
		});
	};
	return { update };
}
