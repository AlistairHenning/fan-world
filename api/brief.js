// Vercel serverless function: GET /api/brief?artist=...&comparables=...&goal=...
// The Qloo key comes only from the QLOO_API_KEY environment variable
// set in Vercel Project Settings — never from the repo, never from the browser.
import { buildBrief } from "../lib/brief.js";

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "http://localhost");
    const artist = url.searchParams.get("artist") || "Mac DeMarco";
    const comparables = (url.searchParams.get("comparables") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const goal = url.searchParams.get("goal") || "Plan a release and tour marketing plan";
    const brief = await buildBrief(artist, comparables, goal);
    res.status(200).json(brief);
  } catch (err) {
    res.status(err.message?.includes("not set") ? 500 : 502).json({ error: err.message });
  }
}
