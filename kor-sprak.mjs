/**
 * Remissidorna (svensk + engelsk) och städning av menysidan.
 * =========================================================
 *
 * Körs i sajtens rot:  node kor-sprak.mjs
 *
 * 1. Bygger /pages/fertilitetplus-x-utlandsbehandling (sv) och …-en (en)
 *    ur skalet från en redan byggd sida.
 * 2. Tar bort språkväxel och hreflang från
 *    /pages/provtagning-infor-behandling-utomlands — den är en egen sida
 *    i menyn, inte den svenska halvan av paret, och ska stå orörd.
 * 3. lang="sv" på alla sidor som saknar det.
 * 4. canonical och hreflang som fullständiga adresser.
 * 5. Båda remissidorna in i sitemap.xml.
 *
 * Allt är idempotent. Samma steg finns i byggkedjan (bygg-live.mjs,
 * kor-live.mjs), så nästa fulla bygge från Claude Design ger samma
 * resultat utan den här filen.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { byggUtlandssidorna, taBortSprakvaxel, ADRESSER } from "./bygg-utlandssidorna.mjs";

const ROT = process.argv[2] ?? ".";
const DOMAN = "https://fertilitetplus.se";
const MENYSIDAN = "/pages/provtagning-infor-behandling-utomlands";

async function* htmlfiler(katalog) {
  for (const p of await fs.readdir(katalog, { withFileTypes: true })) {
    if (p.name === ".git" || p.name === "node_modules") continue;
    const full = path.join(katalog, p.name);
    if (p.isDirectory()) yield* htmlfiler(full);
    else if (p.name.endsWith(".html")) yield full;
  }
}

/* ---- 1 & 2 ------------------------------------------------------- */
for (const s of await byggUtlandssidorna(ROT)) {
  console.log(`remissida ${s.sprak}:       ${s.fil} (${s.storlek} tecken)`);
}
const stadat = await taBortSprakvaxel(ROT, MENYSIDAN);
console.log(`menysidan städad:    ${stadat.resultat}`);

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
const datum = new Date().toISOString().slice(0, 10);
let tillagda = 0;
for (const adress of ADRESSER) {
  const loc = `${DOMAN}${adress}`;
  /* Hela <loc>-elementet jamfors, inte adressen som delstrang: den
     svenska adressen ar en prefix av den engelska. */
  if (sm.includes("<loc>" + loc + "</loc>")) continue;
  sm = sm.replace(
    "</urlset>",
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${datum}</lastmod>\n  </url>\n</urlset>`
  );
  tillagda++;
}
if (tillagda) await fs.writeFile(smFil, sm, "utf8");
console.log(`sitemap:             ${tillagda} nya adresser`);
