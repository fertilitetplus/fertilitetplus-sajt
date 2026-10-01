/**
 * Ordbyten i löpande text, som läggs på efter bygget.
 *
 * Bara exakta fraser — aldrig ett blankt sök-och-ersätt på ordet
 * "telefonkonsultation". Skälet: ordet står också i adresser
 * (/products/telefonkonsultation-med-lakare-…) och i två tjänstenamn som
 * ska vara kvar. Ett blankt byte hade brutit länkar och gjort två olika
 * tjänster till samma namn.
 *
 * Varje fras bär hur många gånger den ska förekomma. Träffar den fler
 * eller färre stannar hela körningen — en fras som börjat matcha något
 * annat ska inte gå igenom tyst.
 *
 * Samma sorts skuld som bygg-innehallsfixar.mjs: hör egentligen hemma i
 * Claude Design, och ska tas bort härifrån när den gjorts där.
 */
import fs from "node:fs/promises";
import path from "node:path";

export const BYTEN = [
  { fran: "en telefonkonsultation.", till: "en konsultation.", vantat: 2 },
  { fran: "Boka telefonkonsultation", till: "Boka konsultation", vantat: 1 },
  { fran: "telefonkonsultation som första steg", till: "konsultation som första steg", vantat: 1 },
  /* "Vid konsultation betalar du med Swish innan samtalet" hade motsagt
     nästa mening om att betala på kliniken. Meningen skiljer telefon från
     besök, så ordet behövs — men inte som sammansättning. */
  { fran: "Vid telefonkonsultation betalar du", till: "Vid konsultation på telefon betalar du", vantat: 1 },
  /* Raden "innan telefonkonsultationen" → "innan konsultationen" är
     borttagen 1 oktober. Frasen fanns bara på den allmänna utlandssidan,
     och den sidan byggs numera om från grunden av
     bygg-utlandssidan-allman.mjs med en text som inte innehåller ordet.
     Regeln hade därför bara stått och varnat om noll träffar. */
];

async function* htmlfiler(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* htmlfiler(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

export async function laggPaTextbyten(rot, byten = BYTEN) {
  const filer = [];
  for await (const f of htmlfiler(rot)) filer.push(f);

  const rapport = [];
  let stopp = false;

  for (const b of byten) {
    let n = 0;
    for (const f of filer) {
      const h = await fs.readFile(f, "utf8");
      n += h.split(b.fran).length - 1;
    }
    if (n !== b.vantat) {
      rapport.push({ fras: b.fran, resultat: `VÄGRADE — hittade ${n}, väntade ${b.vantat}` });
      stopp = true;
    }
  }
  if (stopp) return rapport;

  for (const f of filer) {
    let h = await fs.readFile(f, "utf8");
    const fore = h;
    for (const b of byten) h = h.split(b.fran).join(b.till);
    if (h !== fore) {
      await fs.writeFile(f, h, "utf8");
      rapport.push({ fil: path.relative(rot, f), resultat: "ändrad" });
    }
  }
  return rapport;
}
