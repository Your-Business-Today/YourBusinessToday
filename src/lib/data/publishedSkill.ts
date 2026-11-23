export type PublishedSkill = {
	name: string;
	summary: string;
	howItWorks: string | null;
	isWrite: boolean;
};

export type SkillArea = {
	label: string;
	skills: PublishedSkill[];
	skillCount: number;
};
