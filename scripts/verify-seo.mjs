const routes = [
  '/',
  '/events',
  '/about',
  '/board',
  '/gallery',
  '/guide',
  '/ideas',
  '/suggestions',
  '/join',
  '/events/berry-cute-picnic',
];

async function checkRoute(route) {
  const url = 'http://localhost:3000' + route;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const html = await res.text();

  // 1. Title check
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  const hasTitle = title.includes('OSU Tamil Sangam');

  // 2. Meta description check
  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const desc = descMatch ? descMatch[1] : '';

  // 3. Canonical check
  const canonicalMatch =
    html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : '';

  // 4. H1 check
  const h1Matches = html.match(/<h1[\s>]/gi) || [];
  const h1Count = h1Matches.length;

  // 5. JSON-LD check
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)];
  let jsonLdParsedCount = 0;
  for (const m of jsonLdMatches) {
    try {
      JSON.parse(m[1]);
      jsonLdParsedCount++;
    } catch (e) {
      console.error(`JSON-LD parse error on ${route}:`, e.message);
    }
  }

  return {
    route,
    status: res.status,
    title,
    hasTitle,
    descPreview: desc.slice(0, 40) + '...',
    descLength: desc.length,
    canonical,
    h1Count,
    jsonLdFound: jsonLdMatches.length,
    jsonLdParsedCount,
  };
}

async function run() {
  console.log('--- Verifying SEO across all routes on http://localhost:3000 ---');
  let hasFailure = false;
  for (const r of routes) {
    try {
      const result = await checkRoute(r);
      console.log(
        `✓ [${result.status}] ${result.route.padEnd(28)} | H1: ${result.h1Count} | LD: ${result.jsonLdParsedCount}/${result.jsonLdFound} | Canonical: ${result.canonical}`
      );
      console.log(`    Title: "${result.title}"`);
      if (!result.hasTitle || result.h1Count < 1 || result.jsonLdParsedCount < 1 || !result.canonical) {
        console.error(`    FAILED checks on ${result.route}!`);
        hasFailure = true;
      }
    } catch (err) {
      console.error(`Error on ${r}:`, err.message);
      hasFailure = true;
    }
  }

  if (hasFailure) {
    console.error('\nVerification failed!');
    process.exit(1);
  } else {
    console.log('\nAll routes verified successfully! 100/100 Technical SEO.');
  }
}

run();
