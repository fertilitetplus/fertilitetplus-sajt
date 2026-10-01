/**
 * Språkparet för utlandssidan + två hygienrättningar för hela sajten.
 * ===================================================================
 *
 * Körs i sajtens rot:  node kor-sprak.mjs
 *
 * 1. Bygger den engelska utlandssidan ur skalet från en redan byggd sida.
 * 2. Lägger hreflang och språkväxlare på den svenska systersidan.
 * 3. lang="sv" på alla sidor som saknar det (den engelska sätter "en" själv).
 * 4. canonical och hreflang skrivs som fullständiga adresser.
 * 5. Den engelska adressen in i sitemap.xml.
 *
 * Allt är idempotent — körs den två gånger händer ingenting andra gången.
 * Samma steg finns i byggkedjan (bygg-live.mjs, kor-live.mjs), så nästa
 * fulla bygge från Claude Design ger samma resultat utan den här filen.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { byggUtlandssidanEn, kopplaSvenskaSidan, ADRESS } from "./bygg-utlandssidan-en.mjs";

const ROT = process.argv[2] ?? ".";
const DOMAN = "https://fertilitetplus.se";

async function* htmlfiler(katalog) {
  for (const p of await fs.readdir(katalog, { withFileTypes: true })) {
    if (p.name === ".git" || p.name === "node_modules") continue;
    const full = path.join(katalog, p.name);
    if (p.isDirectory()) yield* htmlfiler(full);
    else if (p.name.endsWith(".html")) yield full;
  }
}

/* ---- 1 & 2 ------------------------------------------------------- */
const en = await byggUtlandssidanEn(ROT);
const sv = await kopplaSvenskaSidan(ROT);
console.log(`engelsk sida:        ${en.fil} (${en.storlek} tecken)`);
console.log(`svenska systersidan: ${sv.resultat}`);

/* ---- 3 & 4 ------------------------------------------------------- */
let langSatt = 0;
let canonicalLagad = 0;
for await (const fil of htmlfiler(ROT)) {
  let h = await fs.readFile(fil, "utf8");
  const fore = h;

  if (!/<html[^>]*\slang=/i.test(h)) {
    h = h.replace(/<html(\s|>)/i, '<html lang="sv"$1');
    if (h !== fore) langSatt++;
  }

  h = h.replace(/<link\s+rel="(?:canonical|alternate)"[^>]*>/gi, (m) => {
    const ny = m.replace(/href="\/([^"]*)"/, `href="${DOMAN}/$1"`);
    if (ny !== m) canonicalLagad++;
    return ny;
  });

  if (h !== fore) await fs.writeFile(fil, h, "utf8");
}
console.log(`lang="sv" satt på:   ${langSatt} sidor`);
console.log(`canonical lagade:    ${canonicalLagad}`);

/* ---- 5 ----------------------------------------------------------- */
const smFil = path.join(ROT, "sitemap.xml");
let sm = await fs.readFile(smFil, "utf8");
const loc = `${DOMAN}${ADRESS}`;
if (sm.includes(loc)) {
  console.log("sitemap:             adressen fanns redan");
} else {
  const datum = new Date().toISOString().slice(0, 10);
  sm = sm.replace(
    "</urlset>",
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${datum}</lastmod>\n  </url>\n</urlset>`
  );
  await fs.writeFile(smFil, sm, "utf8");
  console.log("sitemap:             engelska adressen tillagd");
}
