TRIAGE.md

TP = True Positive · FP = False Positive · WF = Won't Fix


jwt-hardcode.hardcoded-jwt-secret — server.js:64 — TP — the JWT secret is a plaintext literal in source, so anyone with repo access can forge tokens.
md5-used-as-password — server.js:54 — TP — MD5 is broken for password storage and crackable via brute force or rainbow tables.
express-check-csrf-middleware-usage — server.js:18 — WF — real gap, but the app is explicitly never deployed (README says so), so it's not exploitable in this context.
github-actions-mutable-action-tag — sast.yml:15 — WF — checkout action isn't SHA-pinned, but it's an official GitHub action with low realistic risk.
github-actions-mutable-action-tag — sast.yml:23 — WF — same reasoning as #4, for the upload-sarif action.
jwt-algorithm-none (custom rule) — server.js:64 — TP — algorithm: "none" disables signature verification, letting anyone forge an admin token.
