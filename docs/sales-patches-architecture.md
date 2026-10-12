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

The stories that follow — every registered company in a patch, every postcode sector drawn
and marked searched, sightings a person's Claude records with their source, the feed of
changes and the watchers behind it — are the backlog under *Create a Successful Sales
Pipeline* in Your Business Today, one task per step, and are written here as each lands.

## The views

- `/clients/patches` — a map of Great Britain with every live patch as a circle of its radius,
  the create form (prefilled with the postcode nearest a click, through postcodes.io's reverse
  lookup), and the list: name, centre, radius, outcodes, who works it.
- `/clients/patches/[patchId]` — the patch: its header with the outcodes as chips,
  then the same circle map, company panel and distance-ordered list the area map draws,
  for the patch's own search. Add as lead and Add with directors post to the same actions.
- `/clients` gains a Patches door beside Map an area; the Business menu gains Patches.

## The entities

**Patch** — `public.patches`: `name` (unique, at most 80 characters), `centre_postcode`,
`radius_miles` (one of the map's radii), `sic_codes`, `owner_account_id`. **PatchOutcode** — `public.patch_outcodes`: the outcodes within the radius,
laid out once from postcodes.io when the patch is saved. Both are managed by project managers.

The centre is geocoded into `postcode_locations` as the patch is saved, so the overview map
costs no lookup. Every limit is stated in `src/lib/data/patchRules.ts` and read by the form,
the form action and the connector action; `validatePatch` refuses rather than repairs.

## Commands and queries

| Command | Story it serves |
| --- | --- |
| `createPatch` | the area becomes a patch with its outcodes |

| Query | Story it serves |
| --- | --- |
| `listPatches`, `listPatchesWithCentres` | the list and the overview map |
| `getPatch` | one patch |
| `reverseLookupPostcode` | the postcode under a click |

The connector's new `patches` area carries `list_patches`, `create_patch` and `read_patch`;
the map tiles come from `basemap.ts`: Ordnance Survey's Light style on the free OpenData plan
when `PUBLIC_OS_MAPS_API_KEY` is set, OpenStreetMap only as the fallback.
