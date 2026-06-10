// Quick standalone check that the Craigslist static-HTML parsing works
// against the live site. Run: node scripts/test-craigslist.js
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function parseStaticResults(html) {
  const items =
    html.match(/<li class="cl-static-search-result"[\s\S]*?<\/li>/g) ?? [];
  const leads = [];
  for (const item of items) {
    const title = decodeEntities(
      (item.match(/title="([^"]*)"/) || [])[1] ||
        (item.match(/<div class="title">([^<]*)<\/div>/) || [])[1] ||
        ""
    ).trim();
    const url = (item.match(/href="([^"]+)"/) || [])[1];
    if (!title || !url) continue;
    const price = decodeEntities(
      (item.match(/<div class="price">([^<]*)<\/div>/) || [])[1] || ""
    ).trim();
    const location = decodeEntities(
      (item.match(/<div class="location">([^<]*)<\/div>/) || [])[1] || ""
    ).trim();
    leads.push({ title, url, price, location });
  }
  return leads;
}

async function main() {
  for (const section of ["jjj", "ggg"]) {
    const url = `https://saltlakecity.craigslist.org/search/${section}?query=construction`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    });
    console.log(`\n=== ${section} -> HTTP ${res.status}`);
    if (!res.ok) continue;
    const html = await res.text();
    const leads = parseStaticResults(html);
    console.log(`parsed ${leads.length} listings`);
    console.log(leads.slice(0, 4));
  }
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
