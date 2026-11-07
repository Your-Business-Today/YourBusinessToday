import { Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, type Group, type Texture } from 'three';
import { createSurface, surfaceTexture } from './canvasSurface';
import type { FadeGroup } from './fadeGroup';
import { cssColour, type PromoPalette } from './promoPalette';
import { offsetFrom, promoSets } from './promoSets';

const tile = { pixels: 64, dotRadius: 3 };
const ground = { width: 150, depth: 110, tilesAcross: 75, tilesDeep: 55, opacity: 0.55 };

function drawDotTile(palette: PromoPalette): Texture {
	const surface = createSurface(tile.pixels, tile.pixels);
	const { context } = surface;
	const centre = tile.pixels / 2;
	context.fillStyle = cssColour(palette.hairline);
	context.beginPath();
	context.arc(centre, centre, tile.dotRadius, 0, Math.PI * 2);
	context.fill();
	const texture = surfaceTexture(surface);
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(ground.tilesAcross, ground.tilesDeep);
	return texture;
}

/** The dotted ground the map is laid out on, like the grid behind the brand's own banners. */
export function createMapGround(group: Group, palette: PromoPalette, fades: FadeGroup): void {
	const material = new MeshBasicMaterial({ map: drawDotTile(palette), depthWrite: false });
	material.opacity = ground.opacity;
	const plane = new Mesh(new PlaneGeometry(ground.width, ground.depth), fades.add(material));
	plane.rotation.set(-Math.PI / 2, 0, 0);
	plane.position.copy(offsetFrom(promoSets.map, 0, 0, 0));
	group.add(plane);
}
