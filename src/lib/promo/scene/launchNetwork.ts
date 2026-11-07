import {
	AdditiveBlending,
	Group,
	InstancedMesh,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	TubeGeometry,
	type Color,
	type Scene,
	type Texture
} from 'three';
import { easeOutBack, easeOutCubic, progressBetween } from '../promoMotion';
import { beatsInto } from '../promoTimeline';
import { gatheredAt } from './launchGathering';
import { networkNodes, networkReach, type NetworkNode } from './launchNetworkLayout';
import type { PromoPalette } from './promoPalette';
import { vectorOf, promoSets } from './promoSets';

export type LaunchNetwork = { update: (seconds: number) => void };

const arcShape = { segments: 40, radius: 0.16, sides: 5 };
const arcGlow = { luminance: 1.05, mostBrightening: 6 };
const indicesPerQuad = 6;
const luminanceWeights = { red: 0.2126, green: 0.7152, blue: 0.0722 };
const wave = { firstBeat: 0.25, beatsToFarthest: 1.6, drawBeats: 1.2, popBeats: 0.5 };
const nodeLight = { size: 3.2, brightness: 3 };

function luminanceOf(colour: Color): number {
	const { r, g, b } = colour;
	return r * luminanceWeights.red + g * luminanceWeights.green + b * luminanceWeights.blue;
}

function arcStart(node: NetworkNode): number {
	return wave.firstBeat + (node.reach / networkReach) * wave.beatsToFarthest;
}

function createArc(node: NetworkNode, palette: PromoPalette): Mesh {
	const { lines } = palette;
	const lineColour = lines[node.colourIndex];
	const brightening = Math.min(arcGlow.mostBrightening, arcGlow.luminance / luminanceOf(lineColour));
	const colour = lineColour.clone().multiplyScalar(brightening);
	const look = { color: colour, blending: AdditiveBlending, depthWrite: false, transparent: true };
	const shape = new TubeGeometry(node.arc, arcShape.segments, arcShape.radius, arcShape.sides);
	return new Mesh(shape, new MeshBasicMaterial(look));
}

function createLights(palette: PromoPalette, glow: Texture): InstancedMesh {
	const { lines } = palette;
	const colour = palette.chalk.clone().multiplyScalar(nodeLight.brightness);
	const look = { map: glow, color: colour, blending: AdditiveBlending, depthWrite: false, transparent: true };
	const lights = new InstancedMesh(new PlaneGeometry(1, 1), new MeshBasicMaterial(look), networkNodes.length);
	networkNodes.forEach((node, index) => lights.setColorAt(index, lines[node.colourIndex]));
	return lights;
}

function drawArc(arc: Mesh, launchBeats: number, start: number): void {
	const share = easeOutCubic(progressBetween(launchBeats, start, start + wave.drawBeats));
	const drawnSegments = Math.round(share * arcShape.segments);
	arc.geometry.setDrawRange(0, drawnSegments * arcShape.sides * indicesPerQuad);
}

function lightSize(launchBeats: number, start: number): number {
	const landing = start + wave.drawBeats;
	const popped = easeOutBack(progressBetween(launchBeats, landing, landing + wave.popBeats));
	return Math.max(0, popped) * nodeLight.size;
}

/** The moment it goes live: lines race out from the portal to everyone in the business, each lighting up as it lands. */
export function createLaunchNetwork(scene: Scene, palette: PromoPalette, glow: Texture): LaunchNetwork {
	const network = new Group();
	network.position.copy(vectorOf(promoSets.app));
	const arcs = networkNodes.map((node) => createArc(node, palette));
	const lights = createLights(palette, glow);
	const { instanceMatrix } = lights;
	network.add(...arcs, lights);
	scene.add(network);
	const matrix = new Matrix4();
	const update = (seconds: number) => {
		const launchBeats = beatsInto('launch', seconds);
		const gathered = gatheredAt(seconds);
		network.visible = launchBeats > wave.firstBeat && gathered < 1;
		network.scale.setScalar(1 - gathered);
		networkNodes.forEach((node, index) => {
			const start = arcStart(node);
			drawArc(arcs[index], launchBeats, start);
			const size = lightSize(launchBeats, start);
			const { x, y, z } = node.place;
			lights.setMatrixAt(index, matrix.makeScale(size, size, size).setPosition(x, y, z));
		});
		instanceMatrix.needsUpdate = true;
	};
	return { update };
}
