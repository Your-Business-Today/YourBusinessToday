---
name: tutorial-films
description: Film the tutorials — write a short narrated film of this repository's own site, film it on made-up data with the kit's tools in tools/tutorial_videos (recorder, pointer and highlights, title cards, local narrator, composer), and put it in the project's tutorial library in Your Business Today. Use when the person says "Film the tutorials", "make a tutorial video", "film a tutorial for <feature>", "remake the <name> tutorial", or asks for videos teaching people to use what was built. Not for a promotional film alone, and never on a client's real data.
---

# Film the tutorials

A tutorial is a short narrated film of the site doing one job, kept in Your Business Today's tutorial library on the
project, where the people on the project watch it. It is made by the person's own Claude, on this machine, from the
site running locally on made-up data: nothing is generated on GitHub, a server of ours or a paid service.

## 0. The tools are here

`tools/tutorial_videos/` holds them. Where it is missing, install it with the kit
(`bash <kit>/bootstrap.sh --kit <kit> --with-tutorial-films`) on the task's branch; every bootstrap run after that keeps
the tools current by itself. The kit's files there are replaced on every run, so a change to the recorder, the
overlays, the narrator or the composer is made in the kit. The repository's own are `film-look.json`, `places.js` and
`videos/`: read `tools/tutorial_videos/README.md` once for which is which.

Install the narrator once per machine with `bash tools/tutorial_videos/setup_narrator.sh` (Kokoro, local and free).
Node with Playwright and ffmpeg are the rest.

## 1. Agree the films

Take the work from the task in Your Business Today, as any work is. One film teaches one job a user does, in one to
two minutes, so a series follows the site's own sections: getting started first, then each part in the order a new
user meets it. Name each film for the job (*Loading market files*, not *The Imports page*) and give it its section
and its position in the library. Leave out anything shown only from a client's own documents.

## 2. Set the look once

Fill `film-look.json` the first time: the product's name, the series name and the line its last card ends on, the
footnote and badge words, the logo as an inline SVG, the font (a font file in the repository for the badge, or none),
the brand's colours from the brand sheet or the site's own tokens, the narrator's voice and how to say the
repository's abbreviations (`"\\bSPID\\b": "spid"`), and where the site runs locally. It is committed with the scripts.

## 3. Write the script

One file per film in `tools/tutorial_videos/videos/`, numbered for its place (`03_reading_the_calendar.js`), in the
shape the README shows: a title card, an opening beat, then one beat for each thing the user does or reads, and a
closing beat naming the next film (the last film ends with `ending`). Each beat is one or two sentences in plain words,
said while the screen does it: point at what is named, click what is pressed, outline what is read and zoom in on what
is small. Name the screen's parts in `places.js` rather than writing selectors into a script.

Every figure the narrator says is read from the site as filmed, never written from memory: the films are made on
made-up data, so a change to that data or to the site's sums can make a spoken figure wrong, and the film is then
remade.

## 4. Film it

1. Make the made-up data, run the site locally on it, and sign in once if the site needs it, saving the browser's
   state to the path `film-look.json` names. Never film a client's real data, and never a live site.
2. `node tools/tutorial_videos/record.js tools/tutorial_videos/videos/<script>.js local-data/tutorial-videos/films/<nn>`
   speaks every beat, plays the beats in a 1920 by 1080 browser while recording, and composes `film.mp4`,
   `captions.vtt` and `thumbnail.jpg` in that folder. Keep the films out of git: `local-data/` belongs in `.gitignore`.
3. Watch it before it goes anywhere: take stills across the film
   (`ffmpeg -i film.mp4 -vf "fps=1/5,scale=640:-1,tile=3x3" -frames:v 1 sheet.jpg`) and look at them, and read the
   captions. A highlight on the wrong thing, a page still loading or a figure that does not match what is said is
   fixed in the script and filmed again.

## 5. Put it in the library

1. `python3 tools/tutorial_videos/film_facts.py <film folder>` gives the sizes and the length.
2. `add_project_video` on the project with the title, description (what it teaches, saying it is shown on made-up
   data), section, position, `durationSeconds`, the film as `video/mp4`, the thumbnail as `image/jpeg` and the
   captions as `text/vtt`, each with its byte count. A film must be under 50 MB.
3. Send each file to the link it gives with one HTTP PUT
   (`curl -fsS -X PUT -H "Content-Type: video/mp4" --upload-file film.mp4 "<link>"`), the thumbnail and captions
   first. The links last two hours.
4. `record_project_video` with the `videoId`, and the film shows in the library.

To remake a film, upload the new one and leave the old one in place: it is removed only on the person's word.

## 6. Tie it off

The scripts, `places.js` and `film-look.json` are committed on the task's branch and go in by its pull request, as any
change does; the films themselves live only in Your Business Today. The work log on the task names each film added,
with its section and position.
