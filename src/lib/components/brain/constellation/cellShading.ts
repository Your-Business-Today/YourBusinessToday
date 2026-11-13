import { UniformsLib, UniformsUtils, type IUniform } from 'three';

export type SharedCellUniforms = {
	timeSeconds: IUniform<number>;
	viewportHeightPixels: IUniform<number>;
};

export type ContextUniforms = { dimShare: IUniform<number>; brightness: IUniform<number> };

export function createSharedCellUniforms(): SharedCellUniforms {
	return { timeSeconds: { value: 0 }, viewportHeightPixels: { value: 1 } };
}

export function fogUniforms(): Record<string, IUniform> {
	return UniformsUtils.clone(UniformsLib.fog);
}

export const LUMINOUS_GLSL = `
	float fogFade() {
		#ifdef USE_FOG
			#ifdef FOG_EXP2
				return exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
			#else
				return 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
			#endif
		#else
			return 1.0;
		#endif
	}

	vec3 faceTowardsEye(vec3 viewNormal) {
		return gl_FrontFacing ? viewNormal : -viewNormal;
	}

	vec4 luminous(vec3 tint, vec3 viewNormal, vec3 towardsEye, float softness, float whiteness, float glow) {
		float facing = max(0.0, dot(viewNormal, towardsEye));
		float core = pow(facing, softness);
		vec3 colour = mix(tint, vec3(1.0), whiteness * core * core);
		return vec4(colour * (glow * fogFade()), core);
	}
`;
