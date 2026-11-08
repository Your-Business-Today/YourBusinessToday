# The Promo Film

A 46-second film of Your Business Today, drawn in three.js from the site's own words and the
real YBT board. It is one page that is both the interactive film at `/promo` and the source of
the MP4: every frame is a pure function of the film's time, so the recorder can draw any moment
exactly, and the video matches the page frame for frame.

## The stories

| As | I want | So that |
| --- | --- | --- |
| Business owner | to watch a short film of how YBT maps my business, builds my app in the open and has it live in weeks | I understand the offer in under a minute and book a call |
| Business owner | to pause it, jump between its chapters and drag to look around the 3D | I can take in the part I care about at my own pace |
| Your Business Today | an MP4 of the same film with its own soundtrack | the film can be posted wherever the business is promoted |

## The chapters

Seven chapters at 120 beats a minute, each a whole number of bars (`src/lib/promo/promoTimeline.ts`):

| Chapter | Seconds | What happens |
| --- | --- | --- |
| Information | 0–4 | One signal-red dot: every business runs on information |
| The noise | 4–10 | The dot shatters into emails, spreadsheets and memory |
| The map | 10–16 | The noise falls onto a tube map of how information travels through the company |
| Built in the open | 16–26 | The real board: real tasks raised, sized, built, reviewed and sent live, the Live count rising to the board's true total |
| Your app | 26–34 | The construction demo portal's screens, then a phone where the assistant answers "Which jobs are losing money?" |
| Live | 34–38 | Everything gathers into one point and goes live across a network |
| Your Business Today | 38–46 | The dot flies home as the full stop of the extruded YBT wordmark |

## Where things live

- `src/lib/promo/promoScript.ts` holds every word on screen, in the site's own words, with the beats it shows between.
- `src/lib/promo/promoBoard.ts` holds the board's real tasks and `tasksDoneOnTheBoard`, the count of tasks done
  when the film was made (376 on 7 November 2026). Update it before filming a new cut.
- `src/lib/promo/boardStory.ts` says where each task starts and the board beats it moves on; `boardLayout.ts` works out
  every card's place from it.
- `src/lib/promo/scene/` holds the 3D pieces, one module per piece, each updated from the film's time.
- `src/lib/promo/sound/` composes the soundtrack in the browser with an `OfflineAudioContext`, so the page and the
  video play the same music without an audio file.
- `src/lib/components/promo/` is the player: the clock, the controls, the captions and the end card.

## Filming the MP4

The recorder needs ffmpeg and Playwright's Chromium. It draws with SwiftShader, so no GPU is needed.

```
npm run dev
node scripts/promo/renderPromoVideo.ts ybt-promo.mp4 http://127.0.0.1:5173/promo?render 3
```

The last argument is how many workers film at once, each a run of frames in its own browser. The
runs are joined and the soundtrack muxed in as AAC at 1920×1080 and 30 frames a second. Leave the
promo's source alone while it films: the dev server reloads the page when a file it uses changes.
