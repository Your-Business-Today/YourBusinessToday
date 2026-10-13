/** Where a repository keeps what a Claude can do with it: the parity audit, its skills and its agents. */
export const mcpMapSources = {
	parityAuditPath: 'docs/ai/parity-audit.md',
	claudeSkillsFolder: '.claude/skills',
	skillFileName: 'SKILL.md',
	houseSkillsFolder: 'docs/ai/skills',
	agentsFolder: '.claude/agents'
} as const;
