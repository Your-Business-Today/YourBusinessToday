import { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, type Scene } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { chatStateAt } from '../assistantChat';
import { easeOutBack, progressBetween } from '../promoMotion';
import { beatsInto } from '../promoTimeline';
import { createSurface, surfaceTexture } from './canvasSurface';
import { drawChatScreen } from './chatScreen';
import { gatheredAt } from './launchGathering';
import type { PromoPalette } from './promoPalette';
import { offsetFrom, promoSets } from './promoSets';

export type AssistantPhone = { update: (seconds: number) => void };

const body = { width: 4.9, height: 10.4, depth: 0.42, cornerRadius: 0.6, segments: 5, metalness: 0.75, roughness: 0.3 };
const screen = { inset: 0.2, pixelsWide: 600 };
const place = { x: 7.5, y: -1.5, z: 10, turn: -0.3 };
const rise = { fromBeat: 5.5, toBeat: 8, drop: 16, spin: 1.2 };
const sway = { speed: 1.3, height: 0.15, turn: 0.04 };

function createBody(palette: PromoPalette): Mesh {
	const shape = new RoundedBoxGeometry(body.width, body.height, body.depth, body.segments, body.cornerRadius);
	const finish = { color: palette.carriage, metalness: body.metalness, roughness: body.roughness };
	return new Mesh(shape, new MeshStandardMaterial(finish));
}

function createScreen(palette: PromoPalette) {
	const width = body.width - screen.inset * 2;
	const height = body.height - screen.inset * 2;
	const surface = createSurface(screen.pixelsWide, Math.round((screen.pixelsWide * height) / width));
	const texture = surfaceTexture(surface);
	const mesh = new Mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({ map: texture, transparent: true }));
	mesh.position.setZ(body.depth / 2 + screen.inset / 2);
	let drawnState = '';
	const showChat = (appBeats: number) => {
		const state = chatStateAt(appBeats);
		const stateKey = JSON.stringify(state);
		if (stateKey === drawnState) return;
		drawnState = stateKey;
		drawChatScreen(surface, palette, state);
		texture.needsUpdate = true;
	};
	return { mesh, showChat };
}

function placePhone(phone: Group, lifted: number, gathered: number, seconds: number): void {
	const swaying = Math.sin(seconds * sway.speed);
	const lying = 1 - lifted;
	const settled = 1 - gathered;
	const height = place.y - lying * rise.drop + swaying * sway.height;
	phone.position.copy(offsetFrom(promoSets.app, place.x * settled, height * settled, place.z * settled));
	phone.rotation.set(0, place.turn + lying * rise.spin + swaying * sway.turn, 0);
	phone.scale.setScalar(settled);
}

/** A phone that rises beside the portal, its assistant answering a question about the business in plain words. */
export function createAssistantPhone(scene: Scene, palette: PromoPalette): AssistantPhone {
	const phone = new Group();
	const { mesh, showChat } = createScreen(palette);
	phone.add(createBody(palette), mesh);
	scene.add(phone);
	const update = (seconds: number) => {
		const appBeats = beatsInto('app', seconds);
		const risen = progressBetween(appBeats, rise.fromBeat, rise.toBeat);
		const gathered = gatheredAt(seconds);
		const isShown = risen > 0 && gathered < 1;
		phone.visible = isShown;
		if (!isShown) return;
		showChat(appBeats);
		placePhone(phone, easeOutBack(risen), gathered, seconds);
	};
	return { update };
}
