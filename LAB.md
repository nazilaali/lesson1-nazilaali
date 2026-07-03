# Lesson 1 Lab — Build the base SAST pipeline

**Time:** ~30 minutes, self-paced. **You build the CI from scratch** — the repo you forked has only the app.

**Goal:** by the end you have a GitHub Actions pipeline that runs Semgrep on every push, **fails** the build on a high-severity finding, and uploads a SARIF report.

Work through the three checkpoints in order. Each one ends with something you can see working before you move on.

---

## Before you start

1. **Fork** the `vuln-shop-api` repo into your own GitHub account.
2. **Clone** your fork locally, or use the GitHub web editor — either is fine.
3. Confirm Actions are enabled on your fork: repo → **Actions** tab → enable workflows if prompted.

---

## Checkpoint 1 — Get a pipeline running (and seeing findings)

You are going to create the workflow file yourself.

1. In your repo, create the folder and file `.github/workflows/sast.yml`.
2. Write a workflow that:
   - triggers on `push` and `pull_request`
   - runs on `ubuntu-latest`
   - checks out the code
   - installs and runs Semgrep with the default ruleset

   Starting point for the run step (you assemble the rest of the YAML around it):

   ```bash
   pip install semgrep
   semgrep --config p/default .
   ```

3. Commit and push.
4. Go to the **Actions** tab and open the run. **You should see Semgrep findings printed in the job log.**

✅ **Done when:** the workflow runs and the log lists findings from the app.

> Stuck on YAML shape? You need the four top-level keys: `name`, `on`, `jobs`, and under a job: `runs-on` and `steps`. Each step is either a `uses:` (a prebuilt action like `actions/checkout@v4`) or a `run:` (shell commands).

---

## Checkpoint 2 — Make the gate blocking

Right now the job may go green even with findings. Make it **fail** when Semgrep finds a high-severity issue.

1. Change your Semgrep step so it only treats **high-severity** findings as build-breaking. Semgrep exits non-zero when it has blocking findings; the flag to scope severity is:

   ```bash
   semgrep --config p/default --severity ERROR .
   ```

2. Push. The run should now **fail** (red ❌) because the app has high-severity flaws.
3. Now **fix one flaw** in `src/server.js` so you can watch the gate react. Easiest one: find the SQL query built with string concatenation and switch it to a parameterized query (there is a safe example in the same file to copy from).
4. Push again. The specific finding you fixed should disappear from the log.

✅ **Done when:** you have seen the build go **red on a finding**, and seen a finding **disappear after you fixed it**.

> Think about what you just did: you turned a *report* into a *gate*. The exit code is the whole mechanism.

---

## Checkpoint 3 — Emit SARIF

Make the pipeline produce a machine-readable report and surface it in GitHub.

1. Have Semgrep write SARIF output:

   ```bash
   semgrep --config p/default --severity ERROR --sarif --output semgrep.sarif .
   ```

2. Add a step that uploads the SARIF to GitHub's code scanning, using `github/codeql-action/upload-sarif@v3` with `sarif_file: semgrep.sarif`.
3. **Important:** the upload must run *even when the scan step failed* (otherwise a failing gate skips the report). Add `if: always()` to the upload step.
4. Push. After the run, open the repo **Security** tab → **Code scanning**. Your findings should appear there, linked to the exact lines.

✅ **Done when:** SARIF findings show up in the Security tab.

---

## What to submit

- A link to your fork (the workflow must run on push).
- A screenshot of one run that went **red on a finding**, and one that **passed after a fix**.
- A screenshot of findings in the **Security tab** (the SARIF upload).

## Stretch goal (if you finish early)

Write **one** custom Semgrep rule that catches a flaw the default ruleset misses. Look at the `[FLAW 5]` and `[FLAW 6]` tags in `src/server.js` — those are project-specific anti-patterns the defaults won't flag. This is also the start of your homework, so anything you do here counts toward it.
