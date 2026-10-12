# Sales Patches — Architecture

How staff work an area rather than a name: a patch of ground they own, every company
registered in it as at now, the sectors they have covered, what their own Claude found on
the open web, and a feed of what changed. This is the staff side of the sales pipeline
goal; the lead generation doc ([lead-generation-architecture.md](./lead-generation-architecture.md))
describes the map search this grows out of, and its rule that a search result not added is
not kept has one deliberate exception here: the register snapshot, kept so change can be read.

## User stories

| As | I want | So that |
| --- | --- | --- |
| Staff | to save an area (a centre postcode, a radius, optional SIC codes) as a named patch that is mine | Kingston is a thing on the site that keeps what I do in it, and a colleague in Manchester has her own |
| Staff | a map of the UK with every patch drawn on it, and to start a new patch by clicking where I want it | I see what we cover at a glance and choose the next area from the map |
| Staff | the patch map drawn on a basemap we are allowed to use commercially | a second person panning it never gets us blocked |
| Staff | every live company in the latest monthly Companies House file whose registered office is in a patch stored in our database | the patch map shows the businesses there now without the API key |
| Staff | every register postcode in my patches geocoded through the cache the map already uses | the register can be drawn and nothing geocodes twice |
| Staff | every live company registered in my patch on the patch map as at the latest monthly file, hubs and dormant shells told apart | I see the businesses there now and know which pins are registered offices rather than shops |

The stories that follow — every registered company in a patch, every postcode sector drawn
and marked searched, sightings a person's Claude records with their source, the feed of
changes and the watchers behind it — are the backlog under *Create a Successful Sales
Pipeline* in Your Business Today, one task per step, and are written here as each lands.

## The views

- `/clients/patches` — a map of Great Britain with every live patch as a circle of its radius,
  the create form (prefilled with the postcode nearest a click, through postcodes.io's reverse
  lookup), and the list: name, centre, radius, outcodes, who works it.
- `/clients/patches/[patchId]` — the patch: its header with the outcodes as chips, the
  register line (as at which month, how many companies, hubs, dormant, postcodes still to
  geocode), then the circle map with every register company within the radius as a pin, the
  company panel and the nearest companies as a list. A registered-office hub — an address
  holding twenty or more companies, an agent's office — is one pin; a dormant company or one
  with no accounts filed is drawn muted. Add as lead and Add with directors post to the same
  actions as the area map.
- `/clients` gains a Patches door beside Map an area; the Business menu gains Patches.

## The entities

**Patch** — `public.patches`: `name` (unique, at most 80 characters), `centre_postcode`,
`radius_miles` (one of the map's radii), `sic_codes`, `owner_account_id`. **PatchOutcode** — `public.patch_outcodes`: the outcodes within the radius,
laid out once from postcodes.io when the patch is saved. Both are managed by project managers.

**RegisterCompany** — `public.register_companies`, keyed by company number: what the monthly
Companies House file says about every live company registered in a patch outcode — name,
registered address and postcode, outcode and sector, status, incorporation date, account
category, SIC codes, next accounts and confirmation statement due, charge count — with the
first and last month it was seen and `is_gone` for a company a later file no longer carries.
Never purged, so the as-at count and the diff between months stay true. **RegisterLoad** —
`public.register_loads`: which outcode was loaded for which month and how many companies.
**WatchRun** — `public.watch_runs`: one row per loader or watcher run. **SuppressedCompany** —
`public.suppressed_companies`: the erasure path every loader skips. YBT is controller of this
extract of a public register under UK GDPR, keeps business data only, and honours an
objection by suppressing the company number.

The loader is `node scripts/register/load-register-file.mjs <BasicCompanyDataAsOneFile-YYYY-MM-01.zip>`
with `PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` set: it streams the CSV out of the zip,
keeps the rows whose outcode any patch holds, skips suppressed and malformed rows, upserts
through `upsert_register_companies` (a company seen before keeps its first month), marks the
missing gone, and writes `register_loads` and a `watch_runs` row. It does no geocoding: the
`geocode_register_postcodes` admin action, called until nothing remains, fills
`postcode_locations` through the same cache the map uses.

The centre is geocoded into `postcode_locations` as the patch is saved, so the overview map
costs no lookup. Every limit is stated in `src/lib/data/patchRules.ts` and read by the form,
the form action and the connector action; `validatePatch` refuses rather than repairs.

## Commands and queries

| Command | Story it serves |
| --- | --- |
| `createPatch` | the area becomes a patch with its outcodes |
| `loadRegisterFile` | the monthly file becomes register rows for every patch outcode |
| `geocodeRegisterPostcodes` | one page of register postcodes located through the cache |

| Query | Story it serves |
| --- | --- |
| `listPatches`, `listPatchesWithCentres` | the list and the overview map |
| `getPatch` | one patch |
| `reverseLookupPostcode` | the postcode under a click |
| `mapPatch`, `readRegisterForPatch`, `pinsForRegister` | the register in a patch as pins, hubs folded, shells muted |

The connector's new `patches` area carries `list_patches`, `create_patch`, `read_patch`,
`read_patch_companies`, `add_patch_company_as_lead` and, for admins, `geocode_register_postcodes`;
the map tiles come from `basemap.ts`: Ordnance Survey's Light style on the free OpenData plan
when `PUBLIC_OS_MAPS_API_KEY` is set, OpenStreetMap only as the fallback.
