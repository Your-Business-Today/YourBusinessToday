import { AdditiveBlending, Color, ShaderMaterial } from 'three';
import { fogUniforms, setUniform, type ContextUniforms, type SharedCellUniforms } from './cellShading';
import type { IUniform } from 'three';
import { FIBRE_FRAGMENT_SHADER, FIBRE_VERTEX_SHADER } from './fibreShaders';

export type FibreTints = { root: number; span: number; tip: number };

export type FibreAnchoring = 'rootedInSoma' | 'anchoredAtBothEnds';

export type FibreEnd = 'root' | 'tip';

const ROOT_ORIGIN = 0;
const TIP_ORIGIN = 1;

export class FibreMaterial extends ShaderMaterial {
	private readonly growthShare: IUniform<number>;
	private readonly growthOrigin: IUniform<number>;

	constructor(
		tints: FibreTints,
		anchoring: FibreAnchoring,
		shared: SharedCellUniforms,
		context: ContextUniforms
	) {
		const growthShare = { value: 1 };
		const growthOrigin = { value: ROOT_ORIGIN };
		super({
			uniforms: {
				...fogUniforms(),
				timeSeconds: shared.timeSeconds,
				viewportHeightPixels: shared.viewportHeightPixels,
				dimShare: context.dimShare,
				brightness: context.brightness,
				growthShare,
				growthOrigin,
				anchoredAtBothEnds: { value: anchoring === 'anchoredAtBothEnds' ? 1 : 0 },
				rootColour: { value: new Color(tints.root) },
				spanColour: { value: new Color(tints.span) },
				tipColour: { value: new Color(tints.tip) }
			},
			vertexShader: FIBRE_VERTEX_SHADER,
			fragmentShader: FIBRE_FRAGMENT_SHADER,
			fog: true,
			transparent: true,
			depthWrite: false,
			blending: AdditiveBlending
		});
		this.growthShare = growthShare;
		this.growthOrigin = growthOrigin;
	}

	setGrowth(share: number): void {
		setUniform(this.growthShare, share);
	}

	growFrom(end: FibreEnd): void {
		setUniform(this.growthOrigin, end === 'tip' ? TIP_ORIGIN : ROOT_ORIGIN);
	}
}
