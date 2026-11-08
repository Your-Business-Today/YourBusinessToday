import { ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, Vector3 } from 'three';
import type { Material, Scene, Shape } from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { easeInOutCubic, easeOutCubic, mix, progressBetween } from '../promoMotion';
import { beatsInto } from '../promoTimeline';
import { brandGlyphLefts, brandGlyphs, brandMarkOrigin, brandUnitScale, type BrandGlyph } from './brandGlyphs';
import type { PromoPalette } from './promoPalette';
import { offsetFrom, promoSets } from './promoSets';

export type BrandMark = { update: (seconds: number) => void };

type Letter = { letter: Group; home: Vector3 };

const extrusion = { depth: 150, bevelEnabled: true, bevelThickness: 18, bevelSize: 12, bevelSegments: 4, curveSegments: 18 };
const sideFinish = { metalness: 0.55, roughness: 0.35, envMapIntensity: 0.6 };
const sideShade = 0.45;
const flight = { firstBeat: -0.5, beatsApart: 0.4, beats: 1.8, depth: 40, spin: 2.4, drop: 3 };
const sweep = { fromBeat: 3, toBeat: 11, from: -14, to: 14, height: 3, depth: 7, intensity: 40 };

function glyphShapes(glyph: BrandGlyph): Shape[] {
	const loader = new SVGLoader();
	const parsed = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${glyph.outline}"/></svg>`);
	return parsed.paths.flatMap((path) => path.toShapes());
}

function createLetter(glyph: BrandGlyph, left: number, materials: Material[]): Letter {
	const geometry = new ExtrudeGeometry(glyphShapes(glyph), extrusion);
	geometry.computeBoundingBox();
	const middle = new Vector3();
	geometry.boundingBox?.getCenter(middle);
	geometry.translate(-middle.x, -middle.y, -middle.z);
	const mesh = new Mesh(geometry, materials);
	mesh.scale.setScalar(brandUnitScale);
	const letter = new Group();
	letter.add(mesh);
	const homeX = (brandMarkOrigin.x + left + middle.x) * brandUnitScale;
	const homeY = (brandMarkOrigin.y + middle.y) * brandUnitScale;
	return { letter, home: offsetFrom(promoSets.app, homeX, homeY, 0) };
}

function flyLetter({ letter, home }: Letter, brandBeats: number, start: number): void {
	const arrived = easeOutCubic(progressBetween(brandBeats, start, start + flight.beats));
	const away = 1 - arrived;
	letter.visible = arrived > 0;
	letter.position.set(home.x, home.y - away * flight.drop, home.z - away * flight.depth);
	letter.rotation.set(0, away * flight.spin, 0);
}

function sweepLight(light: PointLight, brandBeats: number): void {
	const swept = easeInOutCubic(progressBetween(brandBeats, sweep.fromBeat, sweep.toBeat));
	light.position.copy(offsetFrom(promoSets.app, mix(sweep.from, sweep.to, swept), sweep.height, sweep.depth));
}

/** The wordmark in solid letters: Y, B and T fly in and turn to face the viewer, waiting for the red dot to end them. */
export function createBrandMark(scene: Scene, palette: PromoPalette): BrandMark {
	const sideColour = palette.chalk.clone().multiplyScalar(sideShade);
	const materials = [new MeshBasicMaterial({ color: palette.chalk }), new MeshStandardMaterial({ color: sideColour, ...sideFinish })];
	const letters = brandGlyphs.map((glyph, index) => createLetter(glyph, brandGlyphLefts[index], materials));
	const light = new PointLight(palette.chalk, sweep.intensity);
	letters.forEach(({ letter }) => scene.add(letter));
	scene.add(light);
	const update = (seconds: number) => {
		const brandBeats = beatsInto('brand', seconds);
		letters.forEach((letter, index) => flyLetter(letter, brandBeats, flight.firstBeat + index * flight.beatsApart));
		light.visible = brandBeats > flight.firstBeat;
		sweepLight(light, brandBeats);
	};
	return { update };
}
