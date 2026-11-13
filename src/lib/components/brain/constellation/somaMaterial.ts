import { AdditiveBlending, Color, ShaderMaterial } from 'three';
import {
	LUMINOUS_GLSL,
	fogUniforms,
	type ContextUniforms,
	type SharedCellUniforms
} from './cellShading';

const SOMA_VERTEX_SHADER = `
	#include <fog_pars_vertex>
	varying vec3 viewNormal;
	varying vec3 viewPosition;

	void main() {
		vec4 modelPoint = vec4(position, 1.0);
		vec3 modelNormal = normal;
		#ifdef USE_INSTANCING
			modelPoint = instanceMatrix * modelPoint;
			modelNormal = mat3(instanceMatrix) * modelNormal;
		#endif
		vec4 mvPosition = modelViewMatrix * modelPoint;
		viewPosition = mvPosition.xyz;
		viewNormal = normalize(normalMatrix * modelNormal);
		gl_Position = projectionMatrix * mvPosition;
		#include <fog_vertex>
	}
`;

const SOMA_FRAGMENT_SHADER = `
	#include <fog_pars_fragment>
	${LUMINOUS_GLSL}
	uniform vec3 cellColour;
	uniform float dimShare;
	uniform float brightness;
	varying vec3 viewNormal;
	varying vec3 viewPosition;

	const float CORE_SOFTNESS = 0.9;
	const float CORE_WHITENESS = 0.85;
	const float CORE_GLOW = 1.1;

	void main() {
		vec3 normal = faceTowardsEye(normalize(viewNormal));
		vec3 towardsEye = normalize(-viewPosition);
		vec4 lit = luminous(cellColour, normal, towardsEye, CORE_SOFTNESS, CORE_WHITENESS, CORE_GLOW * brightness);
		gl_FragColor = vec4(lit.rgb, lit.a * dimShare);
		#include <colorspace_fragment>
	}
`;

export class SomaMaterial extends ShaderMaterial {
	constructor(colour: number, shared: SharedCellUniforms, context: ContextUniforms) {
		super({
			uniforms: {
				...fogUniforms(),
				timeSeconds: shared.timeSeconds,
				dimShare: context.dimShare,
				brightness: context.brightness,
				cellColour: { value: new Color(colour) }
			},
			vertexShader: SOMA_VERTEX_SHADER,
			fragmentShader: SOMA_FRAGMENT_SHADER,
			fog: true,
			transparent: true,
			depthWrite: false,
			blending: AdditiveBlending
		});
	}
}
