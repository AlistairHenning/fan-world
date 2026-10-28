# Deploy Fan World to Vercel — without touching the existing site

## The guardrail, first

Alistair's existing site is a **separate Vercel project**:
`alistair-henning-consulting` (team alistairhenning-2874), connected to the
**private** GitHub repo `AlistairHenning/alistair-henning-consulting`,
production branch `main`, domains `www.alistairhenning.com`.

Fan World must be a **new, separate Vercel project**, imported from a **new,
separate GitHub repo**. Do NOT:

- Add Fan World code to the `alistair-henning-consulting` repo or project.
- Attach `alistairhenning.com` or `www.alistairhenning.com` to the Fan World project.
- Change the existing project's branch, domains, or environment variables.

Fan World's live URL will be a default `*.vercel.app` domain from its own
project. That is what the Devpost submission links to.

## Project structure (already Vercel-ready in this repo)

- `index.html` — root entry page, served at `/` on Vercel.
  (Identical copy of `public/index.html`, which the local `server.js` serves.)
- `api/brief.js` — Vercel serverless function, served at `/api/brief`.
  It imports the shared logic from `lib/brief.js`.
- `lib/brief.js` — shared Qloo brief logic, used locally and on Vercel.
- `server.js` — local dev server only; Vercel does not run it.
- `vercel.json` — framework: none. No build step, no dependencies.

## Steps

### 1. Public GitHub repo — PENDING ALISTAIR'S CONFIRMATION

The hackathon submission requires a **public** repo with a visible
open-source licence (MIT `LICENSE` is already in this repo).

**Do not push until Alistair confirms the public repo push in this chat.**
The Vercel host pick alone is not repo-push approval.

When confirmed, create a new public repo (e.g. `AlistairHenning/fan-world`)
and push this folder — and only this folder — to it. Check before pushing
that no file contains a key value: the only key references in the repo
should be the variable name `QLOO_API_KEY`, never a value. Also check
`git status` does not include `.env`, `.vercel`, or any key file.

### 2. Import into Vercel as a NEW project

- Vercel dashboard (signed in via Google, team alistairhenning-2874) →
  Add New → Project → Import the new `fan-world` repo.
- **Verify the project name is new** — it must not be
  `alistair-henning-consulting`, and it must not be linked to that repo.
- Framework Preset: Other. Root Directory: `./` (the repo root).
  No build command, no output directory, no install step needed
  (zero dependencies).
- Deploy.

### 3. Set the API key as a server-side environment variable

In the **new Fan World project only**:
Settings → Environment Variables → add:

- Name: `QLOO_API_KEY`
- Value: the hackathon key from the Qloo email (do not paste it into any
  file, chat transcript excerpt, or repo)
- Environments: Production (and Preview if you want preview deploys to work)

Then redeploy if the first deploy ran before the variable was set.
The key is read server-side in `api/brief.js` via `process.env.QLOO_API_KEY`.
The browser never sees it, and it is never in the repo.

### 4. Verify the live demo

- Open the new `*.vercel.app` URL — the form should load.
- Generate a brief for the canned demo: Mac DeMarco.
- Check: audience portrait, 3-city Scene Map (Vancouver / New York /
  Los Angeles), partnership targets, labelled hypotheses, data trail.
- Direct API check:
  `/api/brief?artist=Mac%20DeMarco&comparables=Homeshake%2C%20King%20Krule`
- If the API returns "QLOO_API_KEY is not set", the env var is missing
  or the deploy predates it — set it and redeploy.

### 5. Confirm the existing site is untouched

- `www.alistairhenning.com` still serves the consulting site.
- The `alistair-henning-consulting` Vercel project shows no new deployment
  from this work.

## Current status (Oct 27)

- Vercel-ready refactor: done, locally verified (see below).
- Vercel MCP connector: **not connected** (`vercel status` = not_connected),
  so deployment cannot be done from here via that connector without a
  separate OAuth connect step. The dashboard route above is the working route.
- Public repo push: **not done, awaiting Alistair's confirmation.**
- Live Vercel URL: **not yet created.**

## Local verification (after refactor)

Run locally with the key as an environment variable only:

```bash
QLOO_API_KEY=<your key> npm start
# http://localhost:3000
# /api/brief?artist=Mac%20DeMarco — verified Oct 27 after refactor
```
