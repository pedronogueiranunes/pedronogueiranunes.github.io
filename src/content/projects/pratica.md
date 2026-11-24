---
title: "Prática: a daily guitar practice app"
category: "Experiments"
kinds: ["4"]
year: "2026"
image: "/assets/project-videos/pratica/poster.webp"
cover: "/assets/project-videos/pratica/poster.webp"
color: "#161616"
tint: "#161616"
order: 35.5
caseSlug: "pratica"
practice: "Personal project"
summary: "A guitar practice app: a 6-month roadmap, a precise metronome, a tuner and a fretboard that follows every click. Runs as a Mac app and in the browser."
strategyTitle: "Less friction, more days practiced."
tools: ["Tauri", "React", "Rust", "TypeScript", "Web Audio"]
services: ["Product design", "Interface design", "AI-assisted development"]
openLabel: "Open the app"
showBody: true
---

## What it does

### Practice every day, with less friction

Prática is the practice tool I wanted when I picked the guitar back up. It lays out a six month roadmap, turns each day into a short routine and keeps a log, so the only decision left is to press play. Every exercise opens with a guide: what to play, what to watch for and a tempo to start at.

The tools sit one tap from the exercise. A precise metronome keeps time, a tuner listens to the real guitar and a fretboard lights up the notes it hears. A chord library shows every shape with its variations and inversions, plays a preview and writes the notation. A sequencer with a twelve style drum machine turns any chord progression into a backing track.

For repertoire there are songs and playlists with chord sheets you can paste or import as ChordPro, transposed on the fly, with the chord diagrams right inside the sheet.

### Plug the guitar into the app

On the Mac app, an Amp tab loads Neural Amp Modeler profiles and runs the guitar through them in real time with low latency. Volume and dry/wet knobs, input and output meters and an oscilloscope show what is happening, and nine pedals shape the sound: noise gate, overdrive, three band EQ, phaser, flanger, chorus, tremolo, delay and reverb. The chord library can also listen to what you play and name the chord, with its inversion and close variations.

## How it is built

### One engine idea, two runtimes

The audio engine is written in Rust and runs inside a Tauri desktop app, so the metronome, tuner, drums and Amp share one clock and never touch the main thread. The same engine design is mirrored in Web Audio, which lets the full app run in the browser and install on an iPhone, and work offline.

Practice data lives in SQLite on the Mac and in IndexedDB on the web, with a small event log that keeps both in step. The interface is React and TypeScript, with a shared core package that holds the music theory, the exercises and the tests. Every audio path is covered by automated checks, and the sounds are synthesized, so there are no third party samples.

## Changelog

### Every step so far

The app is pre 1.0. The labels below group the build history by milestone.

#### v0.6 · Nov 24, 2026

- Amp tab with Neural Amp Modeler profiles, volume and dry/wet knobs, level meters and an oscilloscope.
- Nine pedals: noise gate, overdrive, three band EQ, phaser, flanger, chorus, tremolo, delay and reverb.
- Live chord recognition with inversions, variations and a view of the notes it hears.
- Guides for the 29 routine exercises that had no tab.
- Backing track drums rebuilt with twelve styles, including funk, disco, bossa and drum and bass.

#### v0.5 · Nov 23 to 24, 2026

- Interactive fretboard that shows the notes the tuner picks up.
- Experimental chromagram on the tuner input and a circle of fifths.
- Chord guide that follows the metronome inside chord sheets.
- Separate input and output channels for each audio interface.

#### v0.4 · Nov 23, 2026

- Chord preview with sound and notation, plus inversions and alternative shapes.
- Chord sequencer, drum machine and saved sequences.
- Audio session fix on iPhone.

#### v0.3 · Nov 22, 2026

- Songs, playlists and chord sheets with ChordPro import and export, working offline.
- Chord changes on the metronome beat and a new Roadmap.
- Installable on iPhone, a mobile layout with bigger touch targets and a pixel pick icon.

#### v0.2 · Nov 22, 2026

- Tuner with input profiles for each guitar and interface.
- Measured latency for every audio device.

#### v0.1 · Nov 20 to 21, 2026

- Roadmap, daily routine, practice log and a precise metronome.
- Mac app and web app from the same codebase.
