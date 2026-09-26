async function checkPage(path) {
  const url = `http://localhost:3000${path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`❌ ${path}: HTTP ${res.status}`);
      return;
    }
    const html = await res.text();
    const ldRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    const schemas = [];
    let match;
    while ((match = ldRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        schemas.push(parsed["@type"]);
      } catch (e) {
        schemas.push(`JSON_PARSE_ERROR`);
      }
    }
    const hasCanonical = html.includes('rel="canonical"');
    const hasOgTitle = html.includes('property="og:title"') || html.includes('name="og:title"');
    console.log(`✅ ${path} -> Schemas: [${schemas.join(", ")}], Canonical: ${hasCanonical}, OG: ${hasOgTitle}`);
  } catch (err) {
    console.log(`❌ ${path}: ${err.message}`);
  }
}

async function run() {
  console.log("--- STARTING SEO VERIFICATION AUDIT ---");
  await checkPage("/");
  await checkPage("/about");
  await checkPage("/board");
  await checkPage("/events");
  await checkPage("/events/berry-cute-picnic");
  await checkPage("/gallery");
  await checkPage("/gallery/berry-cute-picnic");
  await checkPage("/guide");
  await checkPage("/initiatives");
  await checkPage("/join");
  await checkPage("/links");
  await checkPage("/suggestions");
  console.log("--- COMPLETED AUDIT ---");
}

run();
