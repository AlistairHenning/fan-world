// Fan World — local dev server (no dependencies, Node >= 18).
// Thin wrapper around lib/brief.js, which is also used by api/brief.js on Vercel.
// The Qloo API key is NEVER stored in this repo. It comes only from the
// QLOO_API_KEY environment variable, server-side. The browser never sees it.
//
// Run:  QLOO_API_KEY=<your key> npm start
// Then: http://localhost:3000
// Canned demo: artist = "Mac DeMarco"

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildBrief } from "./lib/brief.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/api/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, qlooConfigured: Boolean(process.env.QLOO_API_KEY) }));
      return;
    }
    if (url.pathname === "/api/brief") {
      const artist = url.searchParams.get("artist") || "Mac DeMarco";
      const comparables = (url.searchParams.get("comparables") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const goal = url.searchParams.get("goal") || "Plan a release and tour marketing plan";
      const brief = await buildBrief(artist, comparables, goal);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(brief));
      return;
    }
    let filePath = path.join(__dirname, "public", url.pathname === "/" ? "index.html" : url.pathname);
    if (!filePath.startsWith(path.join(__dirname, "public"))) {
      res.writeHead(403); res.end("Forbidden"); return;
    }
    const ext = path.extname(filePath);
    const data = await fs.promises.readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  } catch (err) {
    res.writeHead(err.message?.includes("not set") ? 500 : 502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Fan World scaffold on http://localhost:${PORT}`);
  console.log(`Qloo configured: ${Boolean(process.env.QLOO_API_KEY)}`);
});
