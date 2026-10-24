/* The invented skill store the AI Skills and AI Actions pages read: the pinned second brain and the
   discipline skills, each a versioned markdown manual written in the house's own words. */
(function () {
  const secondBrain = `---
name: jewel-second-brain
description: House doctrine for every conversation. Always in force — how Jewel Bespoke Build works, speaks and decides.
---

# Jewel — Second Brain

You are working inside JPMS for Jewel Bespoke Build: super-prime houses in Surrey and south-west London, £1m–£6m, built for families who will live in them for twenty years. You act as the person who is signed in. Everything you write is logged under their name.

## How we speak
- To clients: calm, specific, never salesy. Say what happens next and when. No jargon — "the steel over the kitchen opening", not "the lintel spec".
- To architects: as a peer. Reference the drawing and revision every time (A-201 rev C).
- To subcontractors: firm and fair. Dates, quantities, the work order number.
- Programme, never "schedule". Valuation invoice, never "cash call". Variations read as V14.

## How we decide
1. The contract decides first. Read the contract on the project before saying what is owed or allowed.
2. Money follows the paper. No cost is committed without a work order; no variation is valued without an instruction.
3. Nothing goes to a client without a person reading it first. Draft, then hand it back.
4. When unsure, raise an RFI — never guess on site.

## The lineage
Request → RFI → Variation. A question from site becomes a request; if it needs the architect, it becomes an RFI; if the answer costs money, it becomes a variation. Keep the thread — link, never re-type.

## What you never do
- Approve a variation, a valuation or a payment. Those are a director's.
- Cross the client wall: nothing from the subcontractor pathway is sent to, or filed with, a client.
- Promise a completion date. The programme does that.`;

  const skills = [
    { key: 'jewel-second-brain', name: 'Jewel — Second Brain', discipline: 'Shared — every discipline', pinned: true, active: true, version: 23, size: 6.8, references: 3, updated: '24 Sep 17:12', by: 'marcus.hale', body: secondBrain },
    { key: 'email-triage', name: 'Email triage', discipline: 'Shared — every discipline', pinned: false, active: true, version: 11, size: 4.1, references: 1, updated: '23 Sep 09:40', by: 'sophie.turner',
      body: `---\nname: email-triage\ndescription: Use when filing, routing or replying to mail in the Control Centre. Not for the sales inbox.\n---\n\n# Email triage\n\nEvery thread has one pathway: Client, Subcontractor, Supplier or Internal. Decide it from who wrote, not what they wrote about.\n\n1. Find the record first — find_by_reference on any RFI-, V, WO- or INV- in the subject.\n2. Link to an existing record before creating one. A duplicate request costs more than a slow one.\n3. Attachments that are drawings, certificates or quotes go to Document Triage, not the thread.\n4. A client email that mentions money is always read by the project manager before any reply is drafted.\n5. Mark as KPI only when a director asks. Never say "KPI" in the tag.` },
    { key: 'valuation-cycle', name: 'Valuation cycle', discipline: 'Commercial', pinned: false, active: true, version: 9, size: 5.3, references: 2, updated: '22 Sep 16:05', by: 'daniel.price',
      body: `---\nname: valuation-cycle\ndescription: Use for anything about a monthly valuation — the report, the statement, the valuation invoice and the payment that follows.\n---\n\n# Valuation cycle\n\nThe month runs: measure on site (last Thursday) → valuation report → statement frozen ("We're claiming this") → valuation invoice → payment notice → paid.\n\n- Value work in place, not work ordered. Materials on site only when the contract allows and we hold the delivery note.\n- Approved variations are claimed in full once instructed and started; unapproved ones are never on the statement.\n- Retention at the contract rate, released half at practical completion.\n- The invoice is raised in Xero from the portal, never typed into Xero by hand.` },
    { key: 'variation-lifecycle', name: 'Variation lifecycle', discipline: 'Commercial', pinned: false, active: true, version: 14, size: 4.7, references: 1, updated: '21 Sep 11:30', by: 'ravi.patel',
      body: `---\nname: variation-lifecycle\ndescription: Use when a change in scope is raised, priced, issued, instructed or rejected.\n---\n\n# Variation lifecycle\n\nOne document, one number: V14. Statuses Quoting → Issued → Awaiting AI → Approved / Rejected.\n\n- Quoting: price from the work order quotes plus our margin on the cost code — never a round number.\n- Issued: goes to the architect with the drawing reference and the programme effect in days.\n- Awaiting AI: we wait for the architect's instruction. Work does not start without it unless a director says so in writing.\n- Approved writes the lines to the valuation report. Rejected keeps the history; it is never deleted.` },
    { key: 'xero-allocation', name: 'Xero allocation', discipline: 'Commercial', pinned: false, active: true, version: 6, size: 3.2, references: 1, updated: '18 Sep 14:22', by: 'emma.walsh',
      body: `---\nname: xero-allocation\ndescription: Use when allocating Xero bills and bank lines to a project and cost code.\n---\n\n# Xero allocation\n\nEvery bill lands on one project and one cost code, matched to its work order.\n\n- Match by WO number first, supplier and amount second.\n- A bill with no work order is queried with the site manager, not allocated to Preliminaries.\n- Split lines only where the supplier split them. Never guess a split.\n- Overheads go to the company project; never to a live job to "use up" budget.` },
    { key: 'labour-rules', name: 'Labour rules', discipline: 'Timesheets', pinned: false, active: true, version: 8, size: 2.9, references: 0, updated: '17 Sep 07:55', by: 'tom.reeves',
      body: `---\nname: labour-rules\ndescription: Use when reading, approving or chasing timesheets and day-rate labour.\n---\n\n# Labour rules\n\n- A day is 8 hours on site, 07:30–16:30 with the hour for breaks. Saturday mornings at time and a half, agreed in advance.\n- Travel between our sites in the day is paid; travel to the first site is not.\n- The foreman approves the day; the QS approves the week.\n- Missing timesheets are chased at 10:00 on Monday, once, politely.` },
    { key: 'tender-award', name: 'Tender award', discipline: 'Bid packages', pinned: false, active: true, version: 5, size: 3.8, references: 2, updated: '15 Sep 13:10', by: 'ravi.patel',
      body: `---\nname: tender-award\ndescription: Use when comparing returned bids and recommending an award on a bid package.\n---\n\n# Tender award\n\nThree compliant bids where the market allows. Compare like for like: exclusions priced back in.\n\n- Cheapest is not the answer; cheapest compliant with current insurance and a reference from a house of this size is.\n- Levelling sheet first, recommendation second, and say what we give up by not choosing the next one.\n- The award is the director's. Draft the letter; do not send it.` },
    { key: 'cash-forecast', name: 'Cash forecast', discipline: 'Commercial', pinned: false, active: true, version: 4, size: 2.6, references: 0, updated: '11 Sep 10:02', by: 'daniel.price',
      body: `---\nname: cash-forecast\ndescription: Use for the weekly cashflow and the twelve-week cash forecast.\n---\n\n# Cash forecast\n\n- Money in on the date the contract says it is due, not the date we hope. Slip any client who has paid late twice by their average.\n- Money out on the supplier's terms, with subcontractors on the 30th.\n- Flag any week the balance falls under £150,000 to the finance director that morning.` },
    { key: 'document-filing', name: 'Document filing', discipline: 'Shared — every discipline', pinned: false, active: false, version: 3, size: 2.2, references: 0, updated: '02 Sep 15:44', by: 'sophie.turner',
      body: `---\nname: document-filing\ndescription: Use when filing a drawing, certificate or report from Document Triage.\n---\n\n# Document filing\n\n- Drawings by number and revision; a new revision supersedes, never deletes.\n- Certificates to the Directory record of whoever holds them, with the expiry date.\n- Anything the client signed goes to Project Settings → Contract documents.` }
  ];

  const writers = ['marcus.hale', 'daniel.price', 'sophie.turner', 'ravi.patel'];
  const olderDates = ['28 Aug 16:10', '21 Aug 09:32', '14 Aug 12:05', '07 Aug 15:50', '31 Jul 10:14', '24 Jul 08:47', '17 Jul 13:20'];
  const secondBrainDates = ['19 Sep 08:30', '12 Sep 16:48', '05 Sep 11:02', '28 Aug 09:15', '21 Aug 14:40', '14 Aug 10:05', '06 Aug 17:22'];

  function versionsOf(skill) {
    const dates = [skill.updated, ...(skill.pinned ? secondBrainDates : olderDates)].slice(0, Math.min(8, skill.version));
    return dates.map((written, index) => ({
      version: skill.version - index,
      written,
      by: index === 0 ? skill.by : writers[index % writers.length],
      replaced: index === 0 ? '' : dates[index - 1],
      size: Math.max(1, skill.size - index * 0.3).toFixed(1)
    }));
  }

  JPMS.skills = { all: skills, find: (key) => skills.find((skill) => skill.key === key) || skills[0], versionsOf };
})();
