import { publishedSkillAreas } from '$lib/server/skills/publishedSkills';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ skillAreas: publishedSkillAreas() });
