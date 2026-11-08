import {
	DoubleSide,
	InstancedMesh,
	MeshBasicMaterial,
	Object3D,
	PlaneGeometry,
	type Scene,
	type Texture
} from 'three';
import { seededRandom } from '../promoRandom';
import { createSurface, surfaceTexture, traceRoundedRectangle } from './canvasSurface';
import { fragmentCard, fragmentDrawings, type FragmentDrawing } from './fragmentDrawings';
import { createFragment, fragmentPose, type Fragment } from './fragmentMotion';
import { cssColour, type PromoPalette } from './promoPalette';

export type NoiseFragments = { update: (seconds: number) => void };

const fragmentsPerKind = 32;
const fragmentSeed = 2026;
const fragmentHeight = 1.6;
const fragmentBrightness = 1.3;

function drawFragmentTexture(drawing: FragmentDrawing, palette: PromoPalette): Texture {
	const surface = createSurface(fragmentCard.width, fragmentCard.height);
	const { context } = surface;
	const box = { x: 3, y: 3, width: fragmentCard.width - 6, height: fragmentCard.height - 6 };
	traceRoundedRectangle(context, box, fragmentCard.radius);
	context.fillStyle = cssColour(palette.carriage);
	context.fill();
	context.lineWidth = fragmentCard.stroke;
	context.strokeStyle = cssColour(palette.hairline);
	context.stroke();
	drawing(context, palette);
	return surfaceTexture(surface);
}

function createKindMesh(drawing: FragmentDrawing, palette: PromoPalette): InstancedMesh {
	const aspect = fragmentCard.width / fragmentCard.height;
	const geometry = new PlaneGeometry(fragmentHeight * aspect, fragmentHeight);
	const material = new MeshBasicMaterial({ map: drawFragmentTexture(drawing, palette), side: DoubleSide });
	material.color.setScalar(fragmentBrightness);
	material.transparent = true;
	return new InstancedMesh(geometry, material, fragmentsPerKind);
}

function placeFragments(mesh: InstancedMesh, fragments: Fragment[], seconds: number, pose: Object3D): void {
	fragments.forEach((fragment, index) => {
		const { position, turn, scale } = fragmentPose(fragment, seconds);
		pose.position.copy(position);
		pose.rotation.set(turn.x, turn.y, turn.z);
		pose.scale.setScalar(scale);
		pose.updateMatrix();
		mesh.setMatrixAt(index, pose.matrix);
	});
	const { instanceMatrix } = mesh;
	instanceMatrix.needsUpdate = true;
}

/** The emails, sheets, invoices, chats and documents that burst out of the dot and swirl until they find their place. */
export function createNoiseFragments(scene: Scene, palette: PromoPalette): NoiseFragments {
	const random = seededRandom(fragmentSeed);
	const pose = new Object3D();
	const kinds = fragmentDrawings.map((drawing, kind) => {
		const mesh = createKindMesh(drawing, palette);
		mesh.frustumCulled = false;
		scene.add(mesh);
		const fragments = Array.from({ length: fragmentsPerKind }, (_, index) =>
			createFragment(index * fragmentDrawings.length + kind, random)
		);
		return { mesh, fragments };
	});
	const update = (seconds: number) => {
		kinds.forEach(({ mesh, fragments }) => placeFragments(mesh, fragments, seconds, pose));
	};
	return { update };
}
