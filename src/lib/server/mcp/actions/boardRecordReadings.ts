import { organisationModuleLabels } from '$lib/data/organisationModules';
import { boardRecordSourceModules, type BoardRecordAsked, type BoardRecordSource, type TakenReading } from '$lib/data/boardroomRecordPaper';
import {
	boardRecordPaperRefusals,
	moduleSwitchedOffForReading,
	moduleSwitchedOffForSource
} from '$lib/data/boardroomRecordPaperRules';
import { readBusinessBrainPageWhole } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import { usableModuleOrganisation } from '../organisationModuleGate';
import { reachableProject } from '../projectAccess';
import { takeBalanceSheet, takeProfitAndLoss, takeTrialBalance } from './boardRecordBooksReadings';
import { readCurrentPage } from './businessBrainReadingRuns';
import { noSuchPageToRead } from './describeBusinessBrainPage';
import { describeHowProjectStands } from './projectStateReading';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type ReadingTaker = (caller: McpCaller, organisation: Organisation, asked: BoardRecordAsked) => Promise<TakenReading>;

async function takeProjectProgress(caller: McpCaller, organisation: Organisation, asked: BoardRecordAsked): Promise<TakenReading> {
	const project = await reachableProject(caller, asked.recordId ?? '');
	if (project === null || project.organisationId !== organisation.id) return boardRecordPaperRefusals.noSuchProject;
	return { reading: await describeHowProjectStands(caller.supabase, project, new Date()) };
}

async function takeBusinessBrainPage(caller: McpCaller, organisation: Organisation, asked: BoardRecordAsked): Promise<TakenReading> {
	const page = await readBusinessBrainPageWhole(caller.supabase, organisation.id, asked.recordId ?? '');
	if (page === null) return noSuchPageToRead;
	return { reading: await readCurrentPage(caller.supabase, organisation, page) };
}

const readingTakers: Record<BoardRecordSource, ReadingTaker> = {
	trial_balance: (caller, organisation, asked) => takeTrialBalance(caller.supabase, organisation, asked),
	balance_sheet: (caller, organisation, asked) => takeBalanceSheet(caller.supabase, organisation, asked),
	profit_and_loss: (caller, organisation, asked) => takeProfitAndLoss(caller.supabase, organisation, asked),
	project_progress: takeProjectProgress,
	business_brain_page: takeBusinessBrainPage
};

/** Whether the caller may read from the source by its module's rule; a project's progress belongs to no module. */
export async function maySourceBeRead(caller: McpCaller, organisation: Organisation, source: BoardRecordSource): Promise<boolean> {
	const module = boardRecordSourceModules[source];
	if (module === null) return true;
	const usable = await usableModuleOrganisation(caller, organisation.id, module);
	return usable !== null;
}

function moduleLabelOf(source: BoardRecordSource): string {
	const module = boardRecordSourceModules[source] ?? 'boardroom';
	return organisationModuleLabels[module];
}

function takingSwitchedOff(source: BoardRecordSource): string {
	return moduleSwitchedOffForSource(source, moduleLabelOf(source));
}

export function readingSwitchedOff(source: BoardRecordSource): string {
	return moduleSwitchedOffForReading(source, moduleLabelOf(source));
}

/** The reading asked for, taken now through the same rule as anything else of its module; nothing is written. */
export async function takeBoardRecordReading(caller: McpCaller, organisation: Organisation, asked: BoardRecordAsked): Promise<TakenReading> {
	const { source } = asked;
	const mayBeRead = await maySourceBeRead(caller, organisation, source);
	if (!mayBeRead) return takingSwitchedOff(source);
	const takeReading = readingTakers[source];
	return takeReading(caller, organisation, asked);
}
