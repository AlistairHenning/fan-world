# Fan World — Qloo Agentic Hackathon

An artist cross-domain audience and tour-city agent built on Qloo's taste graph.
The user is a **small label / manager**, not the artist alone.

One-line pitch: an agent that turns an artist's catalogue into a cross-domain map
of who their fans actually are, where they live, and what else they love — then
drafts the release and tour marketing plan a label would charge for.

## What it does (scaffold, v0.1)

- One form: artist + comparables + release / tour goal.
- Server resolves the artist and comparables via Qloo `/search`.
- Server runs Qloo `/v2/insights` for artist, brand, movie, place, podcast and book.
- Renders: audience portrait, Scene Map, partnership / placement targets,
  labelled hypotheses (each with its Qloo affinity as evidence), a full
  data-trail appendix, and Markdown export.
- Agent behaviours in this scaffold: self-correcting resolution (top Qloo
  match per name), and honest labelling — no claim is made without Qloo data.

## What is NOT in this scaffold yet

- City-filtered Scene Map: implemented for the demo cities Vancouver, New
  York and Los Angeles via `filter.location.query` (verified Oct 26:
  Vancouver returns Western Front, Red Gate, Rickshaw Theatre for
  Mac DeMarco). Bill-mates and local media in the Scene Map are still
  global affinities, not yet city-filtered.
- Demographic read: not fabricated. The brief states this gap explicitly.
- LLM synthesis / critique pass: this scaffold is deterministic from Qloo
  data, which is stronger on the no-overclaim rule. An LLM layer is optional
  and must never add a claim without Qloo evidence.
- Spotify import, auth, collaborator engine, Oblique pass: out of scope per PRD.

## Run locally

```bash
QLOO_API_KEY=<your hackathon key> npm start
# http://localhost:3000
# Canned demo: Mac DeMarco
```

**Never commit a key.** The key comes only from the `QLOO_API_KEY`
environment variable, server-side. The browser never sees it. `.env.example`
in this repo is a placeholder only.

## Deploy

**Vercel — see `DEPLOY.md` for the full, guarded steps.**

In short: Fan World is a **new, separate Vercel project** from a **new,
separate public GitHub repo**. It must not touch the existing
`alistair-henning-consulting` Vercel project, repo, or domains.
Set `QLOO_API_KEY` as a server-side environment variable in the new
project only, never in the repo or in client-side code. The submission
needs a public live demo URL on the new project's `*.vercel.app` domain.

## Devpost submission checklist

- [ ] Public repo with MIT licence (LICENSE in this repo)
- [ ] Live hosted demo URL
- [ ] Text description: lead with the before/after — a plan written by an LLM
      alone vs. this plan grounded in Qloo affinities
- [ ] One-line scenius citation in the writeup, not a layer in the product
- [ ] Deadline: Friday Oct 30, 2026, 8:45 PM PDT — submit that afternoon

## Judging alignment

"If your submission would work the same without Qloo, you're building the
wrong thing" — every section here cites Qloo affinity data. Impact is the
small label / manager who cannot afford a label research budget.
