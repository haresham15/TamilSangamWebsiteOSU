async function main() {
  const res = await fetch('http://127.0.0.1:3100/');
  const html = await res.text();
  console.log('Status:', res.status, 'HTML length:', html.length);
  const woff2 = html.match(/[\/a-zA-Z0-9_\-\.]+\.woff2/g) || [];
  console.log('Found .woff2 links:', woff2.length);
  woff2.slice(0, 5).forEach(w => console.log(' -', w));
  
  // check for font family mentions
  ['Marcellus', 'Outfit', 'Prata', 'Cormorant', 'Mukta'].forEach(font => {
    const hasFont = html.includes(font);
    console.log(`Includes ${font}:`, hasFont);
  });
}
main().catch(console.error);
