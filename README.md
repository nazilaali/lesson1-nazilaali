# vuln-shop-api

A **deliberately vulnerable** Express API used for the AppSec & DevSecOps course, Lesson 1.

> ⚠️ **Do not deploy this anywhere.** It contains intentional security flaws. It exists only so you can point a scanner at it and watch the scanner find them.

## What this is for

In the lab you will stand up a CI pipeline from scratch, wire a SAST scanner (Semgrep) into it, make the pipeline **fail** when high-severity issues are found, and produce a SARIF report. This app is the thing you will scan.

## Run it locally (optional)

You do not need to run the app for the lab — SAST reads the code, it does not execute it. But if you want to:

```bash
npm install
npm start
# server on http://localhost:3000
```

## The flaws

The code has planted flaws tagged in comments as `[FLAW n]`. **Do not read them first.** Run the scanner, see what it reports, then match the findings back to the code. Some flaws are caught by Semgrep's default ruleset; two are project-specific anti-patterns that only a **custom rule** will catch — those are for the homework.

## Files

- `src/server.js` — the app, with all planted flaws
- `package.json` — pinned dependencies

## Lab

Follow `LAB.md` (handed out in class) for the three checkpoints. You will create the entire `.github/workflows/` setup yourself.
