-- 0108: a project's blueprint also keeps its MCP map.
--
-- Beside the domain and the site map, YBT reads what a Claude can do with the
-- product from its repository: the parity audit (docs/ai/parity-audit.md),
-- which gives every story its connector tool and its pages, and the skills and
-- agents under .claude/ and docs/ai/skills. The site map page shows it as the
-- other side of a toggle: what a person sees, what a Claude can do.
--
-- Additive and safe to re-run.

begin;

alter table public.project_blueprints add column if not exists mcp_map jsonb;

commit;

notify pgrst, 'reload schema';
