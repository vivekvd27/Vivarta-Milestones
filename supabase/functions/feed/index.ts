// Supabase Edge Function: `feed`
// ---------------------------------------------------------------------------
// Server-side fetch of Google News RSS for the Industry feed page. Runs in Deno
// on Supabase's edge — no browser CORS limits, no third-party proxy, no rate
// caps. Returns clean JSON the app renders directly.
//
// Deploy (from the project root, with the Supabase CLI installed & logged in):
//   supabase functions deploy feed --project-ref gqjyuvxuyhedaauxibii
// If invocation fails auth from the browser, redeploy with:
//   supabase functions deploy feed --no-verify-jwt --project-ref gqjyuvxuyhedaauxibii
//
// Call: POST { q: "<google news query>" }  ->  { items: [{title, link, source, pubDate}] }

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp("<" + name + "(?:[^>]*)>([\\s\\S]*?)<\\/" + name + ">"));
  return m ? decodeEntities(m[1]) : "";
}

function parseItems(xml: string): Array<Record<string, string>> {
  const items: Array<Record<string, string>> = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) && items.length < 20) {
    const b = m[1];
    let title = tag(b, "title");
    const link = tag(b, "link");
    const pubDate = tag(b, "pubDate");
    const source = tag(b, "source");
    if (!title || !link) continue;
    if (source && title.endsWith(" - " + source)) title = title.slice(0, -(source.length + 3)).trim();
    items.push({ title, link, source, pubDate });
  }
  return items;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    let q = "";
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      q = (body && body.q) || "";
    } else {
      q = new URL(req.url).searchParams.get("q") || "";
    }
    if (!q) return json({ error: "missing q" }, 400);

    const rss = "https://news.google.com/rss/search?q=" + encodeURIComponent(q) + "&hl=en-US&gl=US&ceid=US:en";
    const r = await fetch(rss, { headers: { "User-Agent": "Mozilla/5.0 (compatible; VivartamFeed/1.0)" } });
    if (!r.ok) return json({ error: "upstream " + r.status }, 502);
    const xml = await r.text();
    return json({ items: parseItems(xml) }, 200);
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
