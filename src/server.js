/*
 * vuln-shop-api  —  DELIBERATELY VULNERABLE.  Do not deploy. Teaching use only.
 *
 * This file contains planted security flaws for a SAST lab.
 * Each flaw is tagged so you can find it after the scanner reports it:
 *   [FLAW n]  ... a short description.
 *
 * Your job in the lab is NOT to read these comments first — run the scanner,
 * see what it finds, THEN come back and match findings to the tagged lines.
 */

const express = require("express");
const sqlite3 = require("sqlite3");
const { execFile } = require("child_process");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER, name TEXT, role TEXT)");
  db.run("INSERT INTO users VALUES (1, 'alice', 'admin'), (2, 'bob', 'user')");
});

// [FLAW 1] Hardcoded secret. A SAST tool flags string literals used as keys/tokens.
const JWT_SECRET = "super_secret_key_do_not_share_123";

// [FLAW 2] SQL injection. User input is concatenated straight into the query.
//          source: req.query.name  ->  sink: db.all(<string>)  with no sanitizer.
app.get("/users", (req, res) => {
  const name = req.query.name;
  const query = "SELECT * FROM users WHERE name = '" + name + "'";
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json(rows);
  });
});

// [FLAW 3] Command injection. User input flows into a shell command.
//          source: req.query.host  ->  sink: exec(<string>).
app.get("/ping", (req, res) => {
  const host = req.query.host;
  execFile("ping", ["-c", "1", host], ...) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json({ output: stdout });
  });
});

// [FLAW 4] Weak hashing algorithm. MD5 is broken for password storage.
app.post("/register", (req, res) => {
  const password = req.body.password || "";
  const hash = crypto.createHash("md5").update(password).digest("hex");
  res.json({ stored: hash });
});

// [FLAW 5] Custom-rule territory: this is a project-specific anti-pattern the
//          default ruleset will NOT catch. The team rule is: "never sign a JWT
//          with algorithm 'none' and never disable expiry." This does both.
//          Students write a custom Semgrep rule for this in the homework.
app.post("/token", (req, res) => {
  const user = req.body.user || "guest";
  const token = jwt.sign({ user }, JWT_SECRET, { algorithm: "none", noTimestamp: true });
  res.json({ token });
});

// [FLAW 6] Also custom-rule territory: a debug backdoor. The team rule is:
//          "no route may read req.query.debug to bypass logic." Default rules
//          have no idea this is dangerous — it's specific to this codebase.
app.get("/account", (req, res) => {
  if (req.query.debug === "1") {
    return res.json({ id: 0, name: "root", role: "admin" }); // backdoor
  }
  res.json({ id: 2, name: "bob", role: "user" });
});

// A SAFE endpoint, included on purpose. Your custom rules must NOT fire here.
// This is how you prove precision in the homework: parameterized query = safe.
app.get("/users-safe", (req, res) => {
  const name = req.query.name;
  db.all("SELECT * FROM users WHERE name = ?", [name], (err, rows) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("vuln-shop-api on " + PORT));

module.exports = app;
