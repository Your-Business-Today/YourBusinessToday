-- 0060: task upload grants — the short-lived, one-time upload link a person's
-- Claude asks for so it can send a file to a task straight from its own
-- workspace, at full quality, instead of typing the bytes out as base64.
--
-- A grant is one attachment waiting to arrive: which task, who asked for the
-- link (the upload is recorded under them), the name and type the file will be
-- shown under, and where in the private task-attachments bucket the file lands.
-- The grant's id becomes the attachment's id when the file is recorded. The
-- link expires fifteen minutes after it is granted and is claimed once —
-- recorded_at is set by a single conditional update, so two callers cannot
-- both record it — and the storage link itself refuses a second file at the
-- same path. The app reads the same limits from src/lib/data/taskAttachmentRules.ts.
--
-- Only the connector writes here, through the service role, so the table has
-- row-level security on and no policies. Rows cascade with their task.
-- Additive only and safe to re-run. Run once, by hand, through
-- scripts/run-migration.sh, before the deploy that reads it.

begin;

create table if not exists public.task_upload_grants (
	id uuid primary key default gen_random_uuid(),
	task_id uuid not null references public.tasks (id) on delete cascade,
	granted_to uuid not null references public.profiles (id),
	filename text not null,
	mime_type text not null,
	storage_path text not null unique,
	expires_at timestamptz not null,
	recorded_at timestamptz,
	created_at timestamptz not null default now()
);

alter table public.task_upload_grants drop constraint if exists task_upload_grants_filename_length;
alter table public.task_upload_grants add constraint task_upload_grants_filename_length
	check (char_length(filename) between 1 and 255);

alter table public.task_upload_grants drop constraint if exists task_upload_grants_mime_type_shape;
alter table public.task_upload_grants add constraint task_upload_grants_mime_type_shape
	check (mime_type ~ '^[^/[:space:]]{1,127}/[^/[:space:]]{1,127}$');

create index if not exists task_upload_grants_task_created
	on public.task_upload_grants (task_id, created_at);

alter table public.task_upload_grants enable row level security;

commit;

notify pgrst, 'reload schema';
