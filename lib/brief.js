// Shared Fan World brief logic — used by both the local server
// (server.js) and the Vercel serverless function (api/brief.js).
// The Qloo API key is NEVER stored in this repo. It comes only from the
// QLOO_API_KEY environment variable, server-side. The browser never sees it.

const QLOO_BASE = "https://hackathon.api.qloo.com";

const INSIGHT_TYPES = [
  ["artist", "urn:entity:artist"],
  ["brand", "urn:entity:brand"],
  ["movie", "urn:entity:movie"],
  ["place", "urn:entity:place"],
  ["podcast", "urn:entity:podcast"],
  ["book", "urn:entity:book"],
];

async function qloo(pathname, params = {}) {
  const key = process.env.QLOO_API_KEY;
  if (!key) throw new Error("QLOO_API_KEY is not set in the environment.");
  const url = new URL(QLOO_BASE + pathname);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "X-Api-Key": key } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Qloo ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

function topEntities(data, n = 8) {
  // /search returns { results: [...] }; /v2/insights returns { results: { entities: [...] } }.
  const ents = Array.isArray(data?.results)
    ? data.results
    : data?.results?.entities || data?.entities || [];
  return ents.slice(0, n).map((e) => ({
    name: e.name,
    entity_id: e.entity_id,
    affinity: e.query?.affinity ?? null,
    popularity: e.popularity ?? null,
    address: e.properties?.address || e.address || null,
  }));
}

function affinityLabel(a) {
  if (a == null) return "medium";
  if (a >= 0.95) return "high";
  if (a >= 0.9) return "medium";
  return "low";
}

export async function buildBrief(artistName, comparableNames, goal) {
  const trail = [];

  const searchData = await qloo("/search", { query: artistName });
  trail.push({ query: `GET /search?query=${artistName}`, outputSection: "artist resolution" });
  const artistResults = topEntities(searchData, 1);
  if (!artistResults.length) throw new Error(`No Qloo entity found for "${artistName}".`);
  const artist = artistResults[0];

  const comparables = [];
  for (const name of comparableNames) {
    if (!name.trim()) continue;
    const d = await qloo("/search", { query: name.trim() });
    trail.push({ query: `GET /search?query=${name.trim()}`, outputSection: "comparables resolution" });
    const top = topEntities(d, 1)[0];
    if (top) comparables.push({ name: name.trim(), ...top });
  }

  const affinities = {};
  for (const [label, urn] of INSIGHT_TYPES) {
    const d = await qloo("/v2/insights", {
      "filter.type": urn,
      "signal.interests.entities": artist.entity_id,
    });
    trail.push({
      query: `GET /v2/insights?filter.type=${urn}&signal.interests.entities=${artist.entity_id}`,
      outputSection: `audiencePortrait.affinities.${label}`,
    });
    affinities[label] = topEntities(d, 8);
  }

  const artistNames = affinities.artist.map((a) => a.name);
  const brandNames = affinities.brand.map((a) => a.name);

  // Scene Map: city-filtered place insights, verified Oct 26.
  // filter.location.query genuinely returns places in that city
  // (e.g. Vancouver -> Western Front, Red Gate, Rickshaw Theatre).
  // Bill-mates and local media are global affinities in this scaffold,
  // not yet city-filtered — that is stated in the brief, not hidden.
  const SCENE_CITIES = ["Vancouver", "New York", "Los Angeles"];
  const sceneMap = [];
  for (const city of SCENE_CITIES) {
    const d = await qloo("/v2/insights", {
      "filter.type": "urn:entity:place",
      "signal.interests.entities": artist.entity_id,
      "filter.location.query": city,
    });
    trail.push({
      query: `GET /v2/insights?filter.type=urn:entity:place&signal.interests.entities=${artist.entity_id}&filter.location.query=${city}`,
      outputSection: `sceneMap.${city}`,
    });
    const cityPlaces = topEntities(d, 6);
    sceneMap.push({
      city,
      billmates: artistNames.slice(0, 4),
      venues: cityPlaces.map((p) => (p.address ? `${p.name} — ${p.address}` : p.name)),
      recordShops: [],
      galleries: [],
      localMedia: {
        films: affinities.movie.slice(0, 4).map((a) => a.name),
        books: affinities.book.slice(0, 4).map((a) => a.name),
        podcasts: affinities.podcast.slice(0, 4).map((a) => a.name),
        brands: brandNames.slice(0, 4),
      },
    });
  }

  const hypotheses = [];
  for (const a of affinities.artist.slice(0, 3)) {
    hypotheses.push({
      claim: `This audience overlaps with ${a.name}.`,
      evidence: `Insights (artist) affinity ${a.affinity} for seed ${artist.name}`,
      confidence: affinityLabel(a.affinity),
      label: "audience-overlap",
    });
  }
  for (const b of affinities.brand.slice(0, 3)) {
    hypotheses.push({
      claim: `${b.name} is a plausible partnership / placement target for this audience.`,
      evidence: `Insights (brand) affinity ${b.affinity} for seed ${artist.name}`,
      confidence: affinityLabel(b.affinity),
      label: "partnership-fit",
    });
  }

  return {
    artist: artist.name,
    artist_entity_id: artist.entity_id,
    comparables: comparables.map((c) => c.name),
    goal,
    audiencePortrait: {
      // Demographic read is NOT fabricated here. It is a stated gap
      // for the next iteration, not a claim.
      demographics: { note: "Demographic read not yet implemented in this scaffold; no demographic claim is made." },
      affinities,
    },
    sceneMap,
    partnershipTargets: brandNames.slice(0, 6),
    hypotheses,
    dataTrail: trail,
    export: ["pdf", "markdown"],
    notes: [
      "Every claim in this brief cites a Qloo affinity above; nothing here is generically generatable without Qloo.",
      "Scene Map places are city-filtered via filter.location.query. Bill-mates and local media in the Scene Map are global affinities in this scaffold, not yet city-filtered.",
    ],
  };
}
