async function main() {
  const res = await fetch('http://127.0.0.1:3100/');
  const html = await res.text();
  const cssLinks = html.match(/href="([^"]+\.css[^"]*)"/g) || [];
  console.log('CSS links:', cssLinks);
  for (const match of cssLinks) {
    const url = match.replace(/href="|"/g, '');
    const fullUrl = url.startsWith('http') ? url : `http://127.0.0.1:3100${url}`;
    const cssRes = await fetch(fullUrl);
    const cssText = await cssRes.text();
    console.log(`\n=== CSS from ${url} (length: ${cssText.length}) ===`);
    const fontFaces = cssText.match(/@font-face\s*\{[^}]+\}/g) || [];
    console.log('Font-face rules count:', fontFaces.length);
    fontFaces.slice(0, 5).forEach(ff => console.log(ff));
    
    // Check font families
    const families = cssText.match(/font-family:[^;]+/g) || [];
    console.log('Unique font families in CSS:', [...new Set(families)].slice(0, 15));
  }
}
main().catch(console.error);
