/**
 * Innehållsrättningar som läggs på efter bygget.
 * =============================================
 *
 * VARNING — läs det här innan du lägger till en regel.
 *
 * Regelboken säger att innehåll bor i Claude Design och att konverteraren
 * aldrig rör innehåll. Skälet är att sajten annars glider isär från
 * designen: designen visar en ruta som inte finns live, och nästa person
 * som öppnar designen förstår ingenting.
 *
 * Den här filen bryter medvetet mot den regeln, för att Marie behövde
 * ändringarna live innan designen hann uppdateras. Varje regel här är
 * alltså en SKULD, inte en lösning. När samma ändring är gjord i Claude
 * Design ska regeln tas bort härifrån — den blir då ändå verkningslös,
 * eftersom den inte hittar något att ta bort.
 *
 * Reglerna är skrivna så att de inte kan göra skada om de missar:
 *   - hittar de inte sin text gör de ingenting och rapporterar det
 *   - körs de två gånger händer inget andra gången
 *
 * Rapporten ska läsas. En regel som slutar träffa betyder antingen att
 * designen hunnit ikapp (bra, ta bort regeln) eller att innehållet
 * ändrats under fötterna på oss (dåligt, titta efter).
 */

import fs from "node:fs/promises";
import path from "node:path";

/* Element som aldrig har någon stängningstagg. Utan den här listan letar
   taggSlut() i all evighet efter </img> och hittar fel slut. */
const TOMMA = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr",
]);

/** Slutpositionen för elementet som börjar vid `start`. */
function taggSlut(html, start) {
  const namn = (html.slice(start + 1).match(/^[a-zA-Z][a-zA-Z0-9-]*/) || [])[0];
  if (!namn) return -1;
  if (TOMMA.has(namn.toLowerCase())) return html.indexOf(">", start) + 1;

  const oppna = html.indexOf(">", start);
  if (oppna === -1) return -1;
  if (html[oppna - 1] === "/") return oppna + 1; // <path ... />

  const re = new RegExp(`<${namn}\\b[^>]*>|</${namn}\\s*>`, "g");
  re.lastIndex = start;
  let djup = 0, m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith("</")) djup--;
    else if (m[0].endsWith("/>")) continue; // självstängande, ingen nivå
    else djup++;
    if (djup === 0) return m.index + m[0].length;
  }
  return -1;
}

/**
 * Elementet som omsluter position `pos`, `nivaer` steg upp.
 *
 * Söker bakåt efter en öppningstagg vars balanserade slut ligger efter
 * positionen — det är definitionen av "omsluter". Upprepas för varje nivå.
 */
function omslutande(html, pos, nivaer) {
  let under = pos;
  let traff = null;

  for (let n = 0; n < nivaer; n++) {
    let i = html.lastIndexOf("<", under - 1);
    traff = null;

    while (i !== -1) {
      if (/^<[a-zA-Z]/.test(html.slice(i, i + 2))) {
        const slut = taggSlut(html, i);
        if (slut > under) { traff = { start: i, slut }; break; }
      }
      i = html.lastIndexOf("<", i - 1);
    }

    if (!traff) return null;
    under = traff.start;
  }
  return traff;
}

/**
 * En regel: hitta `text`, gå `nivaer` steg upp, ta bort det elementet.
 *
 * `nivaer: 0` tar bort elementet som texten står direkt i.
 */
export const REGLER = [
  {
    sida: "pages/boka-tid.html",
    namn: "Meningen om bokningssystemet",
    text: "Bokningen sker i vårt nuvarande bokningssystem",
    nivaer: 0,
    varfor: "Bokningen öppnas i ny flik — det behöver inte stå i text.",
  },
  {
    sida: "pages/boka-tid.html",
    namn: "Bokningsrutan Fostertest NIPT",
    /* Ankaret är kortets brödtext, inte rubriken.
       "Fostertest NIPT" står fyra gånger i filen — tre av dem i menyn.
       Första försöket tog bort en menylänk till /pages/nipt-test i stället
       för kortet, rapporterade "borttaget, 2350 tecken", och såg lyckat ut.
       Det syntes bara för att sidan renderades efteråt. Därav kravet på
       unikt ankare längre ner. */
    text: "Harmony NIPT från graviditetsvecka 11",
    nivaer: 1,
    varfor:
      "NIPT behöver ingen egen ruta. Kontrollerat: 'Fostertest Harmony NIPT' " +
      "går att välja inne i Stockholmskalendern, så ingen bokningsväg försvinner.",
  },
  {
    sida: "pages/boka-tid.html",
    namn: "Rutan 'Kommer du från en klinik utomlands?'",
    text: "Kommer du från en klinik utomlands",
    nivaer: 1,
    varfor: "Tas bort ur 'Innan du bokar' enligt Maries markering.",
  },
  {
    sida: "pages/samarbeten.html",
    namn: "Specialistkortet Rika Hammarström",
    /* Ankaret är kortets brödtext, inte namnet: "Hammarström" står fyra
       gånger i filen — i bildens alt, i rubriken och två gånger i texten.
       Den här meningen står en gång. */
    text: "är specialistutbildad gynekolog med över 39 års erfarenhet",
    nivaer: 1,
    varfor: "Ska inte stå med bland specialisterna enligt Marie.",
  },
];

/* ------------------------------------------------------------------ *
 * Infogningar
 * ------------------------------------------------------------------ */

/** Elementet med namnet `tagg` som omsluter `pos`. */
/**
 * Slutet på elementet som bär ett visst attribut, t.ex. `data-karusell`.
 *
 * Behövs för att lägga något EFTER ett helt block, inte efter det kort
 * som råkar innehålla ankartexten. `omslutandeTagg` nedan klättrar till
 * närmaste tagg av ett visst namn; den här pekar direkt på ett utpekat
 * block och räknar sig fram till dess balanserade slut.
 */
function blockMedAttribut(html, attribut) {
  const i = html.indexOf(attribut);
  if (i === -1) return null;
  const start = html.lastIndexOf("<", i);
  if (start === -1) return null;
  const slut = taggSlut(html, start);
  if (slut === -1) return null;
  return { start, slut };
}

function omslutandeTagg(html, pos, tagg) {
  let i = html.lastIndexOf(`<${tagg}`, pos);
  while (i !== -1) {
    const slut = taggSlut(html, i);
    if (slut > pos) return { start: i, slut };
    i = html.lastIndexOf(`<${tagg}`, i - 1);
  }
  return null;
}

/* Stilarna är hämtade ur det befintliga Fertilysis-kortet, tecken för
   tecken, så att det nya kortet inte kan se "nästan rätt" ut.

   Ett undantag: object-fit. De andra loggorna är nästan kvadratiska och
   beskärs utan att något försvinner. UR:s logga är 2361×1271 — nästan
   dubbelt så bred som hög — och en kvadratisk beskärning skulle klippa
   bort "Grupo Internacional de Reproducción" och halva UR-märket. Därför
   contain och vit botten: samma ruta, hela loggan. */
const KORT_STIL =
  "background: rgb(248, 246, 242); padding: 40px 36px; display: grid; " +
  "grid-template-columns: 150px 1fr; gap: 36px; align-items: start;";
const LOGGA_STIL =
  "width: 150px; aspect-ratio: 1 / 1; object-fit: contain; " +
  "border: 1px solid rgb(235, 231, 225); border-radius: 4px; " +
  "background: rgb(255, 255, 255); padding: 12px;";
const RUBRIK_STIL =
  "margin: 0px 0px 16px; font-size: 28px; font-weight: 300; " +
  "letter-spacing: -0.01em; line-height: 1.3;";
const STYCKE_STIL =
  "margin: 0px 0px 14px; font-size: 16px; font-weight: 300; line-height: 1.75; " +
  "color: rgba(58, 53, 48, 0.72); max-width: 44em; text-wrap: pretty;";
const LANK_STIL = "color: rgb(126, 150, 128);";

const UR_LOGGA =
  "https://shop.fertilitetplus.se/cdn/shop/files/grupointernacional-azul.png?width=600";

const UR_KORT =
  `<article style="${KORT_STIL}" data-partnerkort="">` +
  `<img src="${UR_LOGGA}" alt="UR Vistahermosa" loading="lazy" decoding="async" ` +
  `style="${LOGGA_STIL}" data-partnerlogga="">` +
  `<div>` +
  `<h2 style="${RUBRIK_STIL}">UR Vistahermosa, Spanien</h2>` +
  `<p style="${STYCKE_STIL}">FertilitetPlus samarbetar med UR Vistahermosa i Alicante, ` +
  `Spanien – en del av den internationella gruppen UR Group med över 40 års erfarenhet ` +
  `av assisterad befruktning. Kliniken tar emot patienter från hela världen med ett ` +
  `dedikerat internationellt team som guidar dig på ditt eget språk och hjälper till ` +
  `med resa och boende.</p>` +
  `<p style="${STYCKE_STIL}">De erbjuder bland annat IVF, äggdonation, ROPA-metoden och ` +
  `Secure IVF (IVF med PGT-A), tar emot ensamstående kvinnor samt hetero- och samkönade ` +
  `par, och har särskild erfarenhet av komplexa fall som upprepade missfall och låg ` +
  `äggreserv. Första konsultationen är kostnadsfri, och genom deras garantiprogram finns ` +
  `möjlighet till återbetalning om behandlingen inte leder till graviditet.</p>` +
  `<p style="${STYCKE_STIL}">` +
  `<a href="https://urvistahermosainternational.com/en/" target="_blank" rel="noopener" ` +
  `style="${LANK_STIL}">För mer info om UR Vistahermosa</a></p>` +
  `</div></article>`;

/* Aagaards logga ligger i vårt eget repo, inte hos Shopify: den kom som
   bifogad fil och inte ur Shopifys filarkiv. Beskuren från 722×393 till
   600×327 så att den fyller logorutan lika mycket som de övriga. */
const AAGAARD_LOGGA = "/bilder/aagaard.png";

const AAGAARD_KORT =
  `<article style="${KORT_STIL}" data-partnerkort="">` +
  `<img src="${AAGAARD_LOGGA}" alt="Aagaard Fertilitetsklinik" loading="lazy" decoding="async" ` +
  `style="${LOGGA_STIL}" data-partnerlogga="">` +
  `<div>` +
  `<h2 style="${RUBRIK_STIL}">Aagaard Fertilitetsklinik, Danmark</h2>` +
  `<p style="${STYCKE_STIL}">FertilitetPlus samarbetar med Aagaard Fertilitetsklinik i ` +
  `Aarhus, Danmark. Aagaard har mer än 20 års erfarenhet av fertilitetsbehandling och ` +
  `kombinerar hög medicinsk kompetens med närvaro och personlig omsorg.</p>` +
  `<p style="${STYCKE_STIL}">Klinikens specialiserade team följer patienterna nära under ` +
  `hela behandlingsprocessen. Med utgångspunkt i den senaste kunskapen och väldokumenterade ` +
  `metoder inom fertilitetsområdet erbjuder Aagaard ett brett utbud av ` +
  `fertilitetsbehandlingar, inklusive IUI, IVF/ICSI, PGT-A, PGT-M, PGT-SR, äggdonation, ` +
  `ROPA (Shared Motherhood) och Social Freezing. Behandling kan genomföras med både ` +
  `partnersperma och donatorsperma.</p>` +
  `<p style="${STYCKE_STIL}">Aagaard Fertilitetsklinik är godkänd av Styrelsen for ` +
  `Patientsikkerhed i Danmark. Enligt dansk lagstiftning kan fertilitetsbehandling erbjudas ` +
  `fram till dess att den person som ska bära graviditeten fyller 46 år.</p>` +
  `<p style="${STYCKE_STIL}">` +
  `<a href="https://www.aagaardklinik.dk/en" target="_blank" rel="noopener" ` +
  `style="${LANK_STIL}">För mer info om Aagaard Fertilitetsklinik</a></p>` +
  `</div></article>`;

export const INFOGNINGAR = [
  {
    sida: "pages/samarbeten.html",
    namn: "Partnerkortet UR Vistahermosa",
    /* Ankaret är Fertilysis brödtext, inte rubriken: rubriken "Fertilysis"
       står flera gånger på sidan. */
    text: "Fertilysis är ett internationellt laboratorium",
    tagg: "article",
    var: "fore",
    finnsRedan: "UR Vistahermosa",
    html: UR_KORT,
  },
  {
    sida: "pages/samarbeten.html",
    namn: "Partnerkortet Aagaard Fertilitetsklinik",
    /* Samma ankare som UR-kortet, och det är med flit: regeln ovan körs
       först och lägger UR före Fertilysis-kortet, den här lägger Aagaard
       före samma kort. Resultatet blir UR · Aagaard · Fertilysis. */
    text: "Fertilysis är ett internationellt laboratorium",
    tagg: "article",
    var: "fore",
    finnsRedan: "Aagaard Fertilitetsklinik",
    html: AAGAARD_KORT,
  },
  {
    sida: "index.html",
    namn: "Länk till alla omdömen",
    /* Läggs efter hela karusellblocket, inte efter ett kort. Omdömena
       kapas numera vid åtta rader i stället för att scrolla inuti kortet
       (se fp-fixar.css), och då måste det finnas en väg till resten. */
    efterBlocket: 'data-karusell=""',
    finnsRedan: "data-omdomeslank",
    html:
      `<a href="/pages/omdomen" data-omdomeslank="">Läs alla omdömen →</a>`,
  },
];

/** Alla HTML-filer under en katalog. */
async function* htmlfiler(katalog) {
  for (const p of await fs.readdir(katalog, { withFileTypes: true })) {
    if (p.name === ".git" || p.name === "node_modules") continue;
    const full = path.join(katalog, p.name);
    if (p.isDirectory()) yield* htmlfiler(full);
    else if (p.name.endsWith(".html")) yield full;
  }
}

/* ------------------------------------------------------------------ *
 * Menylänkar som pekas om.
 * ------------------------------------------------------------------
 * Menyn ritas i Claude Design och ligger inbakad i varje sida, så en
 * ändrad måladress måste göras här tills den är gjord i designen. Det är
 * alltså en skuld, precis som reglerna ovan.
 *
 * Varför inte ett rakt sök-och-ersätt på adressen: den gamla adressen
 * står 80 gånger i bygget, och fem av dem är brödtextlänkar inne på
 * enskilda sidor ("läs mer om utlandsbehandling"). De ska fortsätta peka
 * på den allmänna sidan — det är den som är deras ämne. Bara länkar med
 * menyns egen etikett byts, och etiketten är unik för menyn och sidfoten.
 * ------------------------------------------------------------------ */
export const MENYLANKAR = [
  {
    namn: "Menyvalet IVF & utlandsbehandlingar",
    etikett: "IVF &amp; utlandsbehandlingar",
    fran: "/pages/provtagning-infor-behandling-utomlands",
    till: "/pages/fertilitetplus-x-utlandsbehandling",
    /* 3 länkar per sida (skrivbordsmeny, mobilmeny, sidfot) × 25 sidor. */
    vantat: 75,
  },
];

export async function riktaOmMenylankar(rot, lankar = MENYLANKAR) {
  const rapport = [];

  for (const r of lankar) {
    const re = new RegExp(
      `(<a[^>]*href=")${r.fran.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}("[^>]*>)${
        r.etikett.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      }(</a>)`,
      "g"
    );

    let totalt = 0;
    for await (const fil of htmlfiler(rot)) {
      const h = await fs.readFile(fil, "utf8");
      let antal = 0;
      const ny = h.replace(re, (_, a, b, c) => {
        antal++;
        return `${a}${r.till}${b}${r.etikett}${c}`;
      });
      if (antal) {
        await fs.writeFile(fil, ny, "utf8");
        totalt += antal;
      }
    }

    /* Samma spärr som på textbytena: hittar regeln inte det den väntar
       sig har menyn ändrats, och då ska den säga till i stället för att
       tyst göra halva jobbet. */
    rapport.push({
      namn: r.namn,
      resultat:
        totalt === r.vantat
          ? `${totalt} länkar ompekade`
          : `VARNING — pekade om ${totalt}, väntade ${r.vantat}`,
    });
  }

  return rapport;
}

export async function laggPaInfogningar(rot, infogningar = INFOGNINGAR) {
  const rapport = [];

  for (const r of infogningar) {
    const fil = path.join(rot, r.sida);
    let h;
    try { h = await fs.readFile(fil, "utf8"); }
    catch { rapport.push({ namn: r.namn, resultat: "FILEN SAKNAS" }); continue; }

    if (h.includes(r.finnsRedan)) {
      rapport.push({ namn: r.namn, resultat: "fanns redan — hoppade över" });
      continue;
    }

    /* Två sätt att peka ut platsen: ett utpekat block (efterBlocket),
       eller en ankartext plus den tagg som omsluter den. */
    let el;
    if (r.efterBlocket) {
      el = blockMedAttribut(h, r.efterBlocket);
      if (!el) { rapport.push({ namn: r.namn, resultat: `HITTADE INGET BLOCK ${r.efterBlocket}` }); continue; }
    } else {
      const pos = h.indexOf(r.text);
      if (pos === -1) { rapport.push({ namn: r.namn, resultat: "ingen träff" }); continue; }
      el = omslutandeTagg(h, pos, r.tagg);
      if (!el) { rapport.push({ namn: r.namn, resultat: `HITTADE INGET <${r.tagg}>` }); continue; }
    }

    const vid = r.var === "fore" ? el.start : el.slut;
    h = h.slice(0, vid) + r.html + h.slice(vid);
    await fs.writeFile(fil, h, "utf8");
    rapport.push({ namn: r.namn, resultat: `infogat ${r.var === "fore" ? "före" : "efter"}, ${r.html.length} tecken` });
  }

  return rapport;
}

export async function laggPaInnehallsfixar(rot, regler = REGLER) {
  const rapport = [];

  /* Flera regler kan träffa samma fil. Filen läses en gång, alla regler
     läggs på, och den skrivs en gång — annars läser regel två en fil som
     regel ett redan ändrat på disk, och positionerna stämmer inte. */
  const perFil = new Map();
  for (const r of regler) {
    if (!perFil.has(r.sida)) perFil.set(r.sida, []);
    perFil.get(r.sida).push(r);
  }

  for (const [relativ, filensRegler] of perFil) {
    const fil = path.join(rot, relativ);
    let h;
    try {
      h = await fs.readFile(fil, "utf8");
    } catch {
      for (const r of filensRegler) rapport.push({ ...r, resultat: "FILEN SAKNAS" });
      continue;
    }

    const fore = h;

    for (const r of filensRegler) {
      const pos = h.indexOf(r.text);
      if (pos === -1) {
        rapport.push({ sida: r.sida, namn: r.namn, resultat: "ingen träff" });
        continue;
      }

      /* Ankaret måste vara unikt i filen.
         Står texten på flera ställen tar vi det första, och det första är
         nästan alltid menyn — den ligger överst och nämner varje sida.
         Det hände på riktigt: regeln för NIPT-rutan pekade på rubriken
         "Fostertest NIPT", träffade menylänken, tog bort den, och
         rapporterade att allt gått bra. Hellre stopp än tyst skada. */
      const antal = h.split(r.text).length - 1;
      if (antal > 1) {
        rapport.push({
          sida: r.sida, namn: r.namn,
          resultat: `VÄGRADE — ankaret "${r.text}" står ${antal} gånger i filen, välj en unik text`,
        });
        continue;
      }

      const el = omslutande(h, pos, r.nivaer + 1);
      if (!el) {
        rapport.push({ sida: r.sida, namn: r.namn, resultat: "HITTADE INGET ELEMENT" });
        continue;
      }

      const borttaget = el.slut - el.start;

      /* Säkerhetsspärr. Träffar en regel fel kan den svälja halva sidan.
         Ett kort i den här designen är några tusen tecken; tiotusentals
         betyder att vi fått tag i ett avsnitt eller hela kroppen. */
      if (borttaget > 20000) {
        rapport.push({
          sida: r.sida, namn: r.namn,
          resultat: `VÄGRADE — ${borttaget} tecken är för mycket, regeln träffar för högt upp`,
        });
        continue;
      }

      h = h.slice(0, el.start) + h.slice(el.slut);
      rapport.push({ sida: r.sida, namn: r.namn, resultat: `borttaget, ${borttaget} tecken` });
    }

    if (h !== fore) await fs.writeFile(fil, h, "utf8");
  }

  return rapport;
}
