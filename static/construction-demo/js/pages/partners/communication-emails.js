/* The invented tagged mail behind the three Communications registers. `category` is the chip slug. */
(function () {
  const email = (category, from, when, subject, preview, tags, extra = {}) => ({ category, from, when, subject, preview, tags, ...extra });

  JPMS.partnersEmails = {
    subcontractor: [
      email('chaser', 'Sophie Turner', '25 Sep 2026, 09:12', 'RE: Revised first-fix quote — Hollowmere House', 'Sam — a reminder that we still need the revised first-fix figure for the orangery circuits before Friday so V14 can go to the architect…', ['V14', 'BP-0017'], { thread: 4 }),
      email('h-s', 'Grace Holloway', '24 Sep 2026, 16:40', 'Insurance certificate expired — Summit Roofing', 'Dean, our records show your public liability certificate lapsed on 31 Aug. You cannot return to site until a current certificate is on file…', [], { attachment: true, thread: 2 }),
      email('info-request', 'Gary Northgate', '24 Sep 2026, 11:03', 'Drainage levels at MH6 — query', 'Liam, invert at MH6 comes out 180mm higher than the drawing shows once we tie into the existing run. Can you confirm with the engineer…', ['WO-0142', 'RFI-049'], { attachment: true }),
      email('general', 'Callum Reid', '23 Sep 2026, 15:27', 'Orangery oak frame — delivery Monday', 'Frame leaves the workshop Friday afternoon; crane booked for 8am Monday. We will need the drive clear and the rear gate open…', ['WO-0138']),
      email('chaser', 'Ravi Patel', '23 Sep 2026, 10:18', 'Outstanding RAMS — lime plastering', 'Kat, still waiting on the RAMS and method statement for the lime plaster works starting on the 5th. Please send today…', [], { thread: 3 }),
      email('info-request', 'Ben Ashby', '22 Sep 2026, 14:52', 'Bath stone sample panel — sign-off needed', 'Sample panel is up by the front entrance. Could the architect and client view it this week so we can release the full order…', ['WO-0136'], { attachment: true }),
      email('h-s', 'Liam Carter', '22 Sep 2026, 07:45', 'Toolbox talk — working near the basement edge', 'Attached the toolbox talk sign-in sheet from this morning. All Northgate operatives present and signed…', [], { attachment: true }),
      email('general', 'Jo Whitaker', '19 Sep 2026, 13:30', 'UFH manifold positions — plant room', 'Marked up the plant room layout with the manifold positions agreed on site. Shout if anything clashes with the joinery…', ['WO-0141', 'BP-0018'], { attachment: true, thread: 2 }),
      email('chaser', 'Sophie Turner', '18 Sep 2026, 17:02', 'Programme update needed — slate roof', 'Dean, please send an updated programme for the roof covering — the scaffold hire is running on and we need a finish date…', ['WO-0139']),
      email('general', 'Ruth Greenway', '17 Sep 2026, 09:20', 'Terrace levels & planting plan', 'Planting plan rev B attached with the revised terrace levels. Happy to walk it with you on Thursday…', ['BP-0022'], { attachment: true })
    ],
    supplier: [
      email('materials', 'Kestrel Timber Merchants', '25 Sep 2026, 08:30', 'Delivery confirmation — roof battens & membrane', 'Your order SO-44821 is booked for delivery Tuesday 29 Sep, AM. Driver will call 30 minutes ahead…', ['WO-0145'], { attachment: true }),
      email('finishes', 'Stoneleigh Tiles & Stone', '24 Sep 2026, 15:12', 'Limestone flooring — batch samples ready', 'The three batch samples of the honed limestone are ready for collection, or we can courier them to site…', ['BP-0021'], { thread: 3 }),
      email('materials', 'Meridian Builders Supplies', '24 Sep 2026, 10:44', 'Back-order — NHL 3.5 lime', 'Unfortunately NHL 3.5 is on back-order until 9 Oct. We can offer NHL 5 from stock or split the order…', [], { thread: 2 }),
      email('finishes', 'Harbour Glazing Systems', '23 Sep 2026, 16:05', 'Frame colour sample — bronze anodised', 'Following the site meeting, please find the bronze anodised sample chip and the RAL alternatives…', ['WO-0143'], { attachment: true }),
      email('materials', 'Meridian Builders Supplies', '22 Sep 2026, 12:10', 'Quote — blockwork & drainage sundries', 'Quote Q-7731 attached for the blockwork, lintels and drainage sundries per your schedule…', [], { attachment: true }),
      email('finishes', 'Stoneleigh Tiles & Stone', '19 Sep 2026, 11:38', 'Bathroom tiles — lead time update', 'The zellige tiles for bathrooms 2 and 3 are now 6 weeks from order. The client’s alternative is in stock…', ['V16']),
      email('materials', 'Kestrel Timber Merchants', '17 Sep 2026, 09:02', 'Invoice INV-K-30914', 'Please find attached our invoice for the roof timbers delivered 10 Sep…', ['WO-0145'], { attachment: true })
    ],
    internal: [
      email('general', 'Marcus Hale', '25 Sep 2026, 08:05', 'Hollowmere — client walkround Tuesday', 'All, the Whitfields are visiting Tuesday 11am. Sophie to lead; Liam please make sure the orangery base and basement are presentable…', [], { thread: 3 }),
      email('general', 'Daniel Price', '24 Sep 2026, 17:48', 'September valuations — cut-off', 'Valuation figures by Monday noon please. Ravi, the Coach House valuation needs the variations split out this month…', [], { thread: 2 }),
      email('general', 'Emma Walsh', '24 Sep 2026, 12:20', 'Supplier statements reconciled', 'Kestrel and Meridian statements reconciled for August. Two bills queried with Meridian — details in the thread…', [], { attachment: true }),
      email('general', 'Grace Holloway', '23 Sep 2026, 09:33', 'H&S audit schedule — October', 'Proposed audit dates for October attached. Kingsridge pre-start audit pencilled for the 14th…', ['HSA-0004'], { attachment: true }),
      email('general', 'Sophie Turner', '22 Sep 2026, 18:10', 'Coach House — stair balustrade decision', 'Client has chosen the painted spindle option. I’ll raise the variation tomorrow once Ravi has the price…', ['RFI-052']),
      email('general', 'Ravi Patel', '21 Sep 2026, 14:02', 'Kingsridge tender list — groundworks', 'Shortlist for the Kingsridge groundworks package attached. Suggest we add Northgate given Hollowmere…', [], { attachment: true, thread: 2 })
    ]
  };
})();
