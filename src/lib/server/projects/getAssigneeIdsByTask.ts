import type { SupabaseClient } from "@supabase/supabase-js";
import { idBatches } from "$lib/server/schema/idBatches";

type AssigneeRow = { task_id: string; profile_id: string };

export async function getAssigneeIdsByTask(
  supabase: SupabaseClient,
  taskIds: string[],
): Promise<Map<string, string[]>> {
  const batches = await Promise.all(
    idBatches(taskIds).map((batch) => readAssignees(supabase, batch)),
  );
  const assigneeIdsByTask = new Map<string, string[]>();
  for (const row of batches.flat()) {
    const assigneeIds = assigneeIdsByTask.get(row.task_id) ?? [];
    assigneeIds.push(row.profile_id);
    assigneeIdsByTask.set(row.task_id, assigneeIds);
  }
  return assigneeIdsByTask;
}

async function readAssignees(
  supabase: SupabaseClient,
  taskIds: string[],
): Promise<AssigneeRow[]> {
  const { data, error } = await supabase
    .from("task_assignees")
    .select("task_id, profile_id")
    .in("task_id", taskIds);
  if (error) throw error;
  return data;
}
