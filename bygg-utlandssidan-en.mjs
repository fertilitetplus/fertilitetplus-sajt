/**
 * Den engelska utlandssidan.
 * =========================
 *
 * Varför den genereras i stället för att ritas i Claude Design
 * -----------------------------------------------------------
 * Sidan finns inte i designen och har aldrig gjort det. Den bodde i en
 * temamall i Shopifys gamla tema — `page.f-x-utlandsbehandling-en.json` —
 * som inte följde med till det publicerade temat. Därför visade adressen
 * vitamindroppsinnehåll fram till nu.
 *
 * Att bygga den här är alltså inte en skuld mot designen, på samma sätt
 * som omdirigeringssidorna inte är det: de finns inte heller i designen.
 * Den svenska systersidan DÄREMOT finns i Claude Design, och ska rättas
 * där — inte här.
 *
 * Så här hålls den i takt med resten av sajten
 * -------------------------------------------
 * Skalet — huvud, meny, sidfot, typsnitt, cookiebanner, mätning, chatt —
 * klipps ut ur en redan byggd sida. Inget av det skrivs för hand. Ändras
 * menyn i Claude Design ändras den här sidans meny med, vid nästa bygge,
 * utan att någon behöver komma ihåg det.
 *
 * Bara mittpartiet är nytt, och det är skrivet i samma stilvokabulär som
 * de andra sidorna: samma mått, samma färger, samma typsnittstrappa.
 *
 * Innehållet är hämtat ord för ord ur det gamla temat, inte avläst ur
 * skärmbilder. Se claude/utlandssidan-innehall-en.md.
 */

import fs from "node:fs/promises";
import path from "node:path";

export const ADRESS = "/pages/fertilitetplus-x-utlandsbehandling-en";
export const SVENSK_ADRESS = "/pages/provtagning-infor-behandling-utomlands";
const DOMAN = "https://fertilitetplus.se";

/** Sidan bokar mot sin egen kalender — inte samma som den svenska. */
const BOKNING =
  "https://patient.nu/portal/public/calendar/a52b5984-d7b3-4ab8-96cc-ad9831820bf6#step-1";

const TITEL = "Tests and ultrasounds in Sweden for treatment abroad | FertilitetPlus";
const BESKRIVNING =
  "Referred by a clinic abroad? Have your blood tests, ultrasounds and sperm " +
  "analysis done at FertilitetPlus in Sweden, without travelling back and forth.";

/* --- Stilvokabulär, hämtad ur de byggda sidorna ------------------- */
const S = {
  sektion: "max-width: 1600px; margin: 0px auto; padding: 112px 40px 64px;",
  sektionTat: "max-width: 1600px; margin: 0px auto; padding: 0px 40px 96px;",
  ogonbryn:
    "margin: 0px 0px 18px; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; " +
    "text-transform: uppercase; color: rgb(126, 150, 128);",
  h1:
    "margin: 0px 0px 26px; font-family: Cormorant, Georgia, serif; font-style: italic; " +
    "font-weight: 400; font-size: 62px; line-height: 1.08; letter-spacing: -0.01em;",
  ingress:
    "margin: 0px; font-size: 16px; font-weight: 300; line-height: 1.75; " +
    "color: rgba(58, 53, 48, 0.75); max-width: 40em;",
  h2:
    "margin: 0px 0px 24px; font-size: 28px; font-weight: 300; letter-spacing: -0.01em; " +
    "color: rgb(58, 53, 48); line-height: 1.3;",
  h3:
    "margin: 0px 0px 12px; font-size: 17px; font-weight: 600; color: rgb(58, 53, 48); " +
    "line-height: 1.4;",
  brod:
    "margin: 0px; font-size: 16px; font-weight: 300; line-height: 1.75; " +
    "color: rgba(58, 53, 48, 0.72);",
  kort: "background: rgb(235, 231, 225); border-radius: 4px; padding: 36px 32px;",
  knappFylld:
    "background: rgb(126, 150, 128); color: rgb(248, 246, 242); padding: 15px 32px; " +
    "border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; " +
    "text-decoration: none; display: inline-block;",
  knappTom:
    "background: transparent; color: rgb(58, 53, 48); border: 1px solid rgb(200, 181, 162); " +
    "padding: 15px 32px; border-radius: 4px; font-size: 13px; font-weight: 600; " +
    "letter-spacing: 0.04em; text-decoration: none; display: inline-block;",
};

const rutnat = (minsta) =>
  `display: grid; grid-template-columns: repeat(auto-fit, minmax(${minsta}px, 1fr)); gap: 24px;`;

/* --- Innehållet --------------------------------------------------- */

const STEG = [
  ["Book & attach your results",
   "Book a consultation online and attach the test list/protocol from your clinic directly in the booking (not by email)."],
  ["Consultation",
   "By phone or at our clinic in Stockholm, a midwife or nurse goes through your results and plans your sampling."],
  ["We book & refer",
   "We write referrals for your blood tests and book your ultrasound. Your results are delivered to you, and you have a named contact all the way."],
];

const HJALP = [
  ["Ultrasound & monitoring", "Follicle and lining scans, carried out by a doctor at our clinic in Stockholm."],
  ["Blood tests & hormones", "Tailored to your cycle, with referrals to the lab."],
  ["Sperm analysis", "Standard and extended sperm analysis for the male partner, from SEK 2,200."],
  ["A named contact", "One person with you the whole way, from consultation to results."],
  ["Immunological treatment", "Intralipid infusions as part of your fertility treatment, given by a midwife or nurse."],
];

const PRISER = [
  ["Consultation for treatment abroad", "By phone or at the clinic · review of protocol &amp; planning", "SEK 1,200"],
  ["Blood tests", "Priced individually, provided after review of your protocol", "Added on"],
  ["Ultrasound", "Follicle/lining scan, by a doctor (Stockholm)", "SEK 1,900"],
  ["Sperm analysis", "For the male partner · standard &amp; extended test", "from SEK 2,200"],
  ["Intralipid infusion", "Immunological treatment given as an infusion · weekday / weekend", "SEK 1,600 / 2,200"],
];

const PRAKTISKT = [
  ["Consultation", "By phone or at our clinic in Stockholm, with a midwife or nurse."],
  ["Ultrasound", "At our clinic in Stockholm (Värtavägen 30), carried out by a doctor."],
  ["Sperm analysis", "Standard or extended sperm analysis for the male partner, from SEK 2,200."],
  ["Intralipid", "Intralipid infusion, SEK 1,600 (weekday) / SEK 2,200 (weekend). You need to tolerate egg and soy."],
  ["No referral needed", "No referral and no waiting times – book online anytime."],
];

/* Språkväxlaren.
   Ett par länkar, inte en meny: två språk behöver ingen rullgardin. Den
   man står på är inte klickbar — annars är det oklart vilken som gäller. */
function sprakvaxel(aktivt) {
  const aktiv =
    "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; " +
    "color: rgb(58, 53, 48);";
  const passiv =
    "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; " +
    "color: rgba(58, 53, 48, 0.55); text-decoration: none;";
  const delare =
    "font-size: 12px; color: rgba(58, 53, 48, 0.3); margin: 0px 10px;";

  const sv = aktivt === "sv"
    ? `<span style="${aktiv}" aria-current="true">Svenska</span>`
    : `<a href="${SVENSK_ADRESS}" hreflang="sv" lang="sv" style="${passiv}">Svenska</a>`;
  const en = aktivt === "en"
    ? `<span style="${aktiv}" aria-current="true">English</span>`
    : `<a href="${ADRESS}" hreflang="en" lang="en" style="${passiv}">English</a>`;

  return (
    `<div data-fp-sprakvaxel style="max-width: 1600px; margin: 0px auto; ` +
    `padding: 28px 40px 0px; display: flex; align-items: center;">` +
    sv + `<span style="${delare}" aria-hidden="true">·</span>` + en + `</div>`
  );
}

export function sprakvaxelFor(sprak) {
  return sprakvaxel(sprak);
}

function innehall() {
  const steg = STEG.map(([rubrik, text], i) =>
    `<div>` +
    `<div style="width: 34px; height: 34px; border-radius: 50%; background: rgb(126, 150, 128); ` +
    `color: rgb(248, 246, 242); display: flex; align-items: center; justify-content: center; ` +
    `font-size: 14px; font-weight: 600; margin-bottom: 18px;" aria-hidden="true">${i + 1}</div>` +
    `<h3 style="${S.h3}">${rubrik}</h3><p style="${S.brod}">${text}</p></div>`
  ).join("");

  const hjalp = HJALP.map(([rubrik, text]) =>
    `<div style="${S.kort}"><h3 style="${S.h3}">${rubrik}</h3><p style="${S.brod}">${text}</p></div>`
  ).join("");

  const priser = PRISER.map(([namn, beskrivning, pris]) =>
    `<div style="display: flex; gap: 24px; justify-content: space-between; align-items: baseline; ` +
    `padding: 22px 0px; border-bottom: 1px solid rgb(235, 231, 225); flex-wrap: wrap;">` +
    `<div style="flex: 1 1 320px;">` +
    `<h3 style="${S.h3}">${namn}</h3>` +
    `<p style="${S.brod} font-size: 15px;">${beskrivning}</p></div>` +
    `<p style="margin: 0px; font-size: 17px; font-weight: 600; color: rgb(126, 150, 128); ` +
    `white-space: nowrap;">${pris}</p></div>`
  ).join("");

  const praktiskt = PRAKTISKT.map(([namn, text]) =>
    `<div style="display: flex; gap: 32px; padding: 20px 0px; ` +
    `border-bottom: 1px solid rgb(235, 231, 225); flex-wrap: wrap;">` +
    `<h3 style="${S.h3} margin: 0px; flex: 0 0 220px;">${namn}</h3>` +
    `<p style="${S.brod} flex: 1 1 320px;">${text}</p></div>`
  ).join("");

  return (
    sprakvaxel("en") +

    `<section style="${S.sektion} padding-top: 44px;">` +
    `<p style="${S.ogonbryn}">For patients referred by a clinic abroad</p>` +
    `<h1 style="${S.h1}">Your ultrasounds and blood tests, done in Sweden</h1>` +
    `<p style="${S.ingress}">Your clinic works with FertilitetPlus so you can have your ` +
    `sampling, ultrasounds and sperm analysis here in Sweden, without travelling back and ` +
    `forth during your treatment.</p>` +
    `<div style="margin-top: 36px; display: flex; gap: 14px; flex-wrap: wrap;">` +
    `<a href="${BOKNING}" target="_blank" rel="noopener" style="${S.knappFylld}">Book a consultation</a>` +
    `<a href="#how-it-works" style="${S.knappTom}">How it works</a></div>` +
    `</section>` +

    `<section id="how-it-works" style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">How it works</p>` +
    `<h2 style="${S.h2}">Three simple steps</h2>` +
    `<div style="${rutnat(280)} margin-top: 32px;">${steg}</div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">How we help you</p>` +
    `<h2 style="${S.h2}">What we can help you with</h2>` +
    `<div style="${rutnat(300)} margin-top: 32px;">${hjalp}</div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">Prices</p>` +
    `<h2 style="${S.h2}">What it costs</h2>` +
    `<div style="margin-top: 24px; border-top: 1px solid rgb(235, 231, 225);">${priser}</div>` +
    `<p style="${S.brod} margin-top: 28px; font-size: 15px; max-width: 52em;">Prices in SEK. ` +
    `The cost of blood tests and lab work is added on and depends on which analyses your ` +
    `clinic requests. Please note: a few tests we are not able to refer (for example ` +
    `chlamydia and cervical/cell samples).</p>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">Your privacy</p>` +
    `<h2 style="${S.h2}">Why put it in the booking and not by email?</h2>` +
    `<div style="border-left: 3px solid rgb(126, 150, 128); background: rgb(235, 231, 225); ` +
    `padding: 28px 32px; border-radius: 0px 4px 4px 0px; max-width: 60em;">` +
    `<p style="${S.brod}"><strong style="font-weight: 600; color: rgb(58, 53, 48);">` +
    `Data protection (GDPR).</strong> To protect your personal data, we cannot receive ` +
    `medical documents by email. Putting your test list securely in the booking is the safe ` +
    `and lawful way – and it lets us take real responsibility for your care.</p></div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">Good to know</p>` +
    `<h2 style="${S.h2}">Practical details</h2>` +
    `<div style="margin-top: 24px; border-top: 1px solid rgb(235, 231, 225);">${praktiskt}</div>` +
    `</section>` +

    `<section style="max-width: 1600px; margin: 0px auto; padding: 0px 40px 112px;">` +
    `<div style="background: rgb(126, 150, 128); color: rgb(248, 246, 242); border-radius: 4px; ` +
    `padding: 72px 40px; text-align: center;">` +
    `<h2 style="${S.h2} color: rgb(248, 246, 242); margin-bottom: 18px;">Ready to book?</h2>` +
    `<p style="margin: 0px auto 32px; font-size: 16px; font-weight: 300; line-height: 1.75; ` +
    `color: rgba(248, 246, 242, 0.88); max-width: 34em;">Book your consultation online – no ` +
    `referral and no waiting times. Don't forget to attach your test list/protocol from your ` +
    `clinic.</p>` +
    `<a href="${BOKNING}" target="_blank" rel="noopener" style="background: rgb(248, 246, 242); ` +
    `color: rgb(58, 53, 48); padding: 15px 36px; border-radius: 4px; font-size: 13px; ` +
    `font-weight: 600; letter-spacing: 0.04em; text-decoration: none; display: inline-block;">` +
    `Book a consultation</a></div></section>`
  );
}

const TOMMA = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr",
]);

/** Slutpositionen för elementet som börjar vid `start`. */
function taggSlut(html, start) {
  const namn = (html.slice(start + 1).match(/^[a-zA-Z][a-zA-Z0-9-]*/) || [])[0];
  if (!namn) return -1;
  if (TOMMA.has(namn.toLowerCase())) return html.indexOf(">", start) + 1;
  const o = html.indexOf(">", start);
  if (o === -1) return -1;
  if (html[o - 1] === "/") return o + 1;
  const re = new RegExp(`<${namn}\\b[^>]*>|</${namn}\\s*>`, "g");
  re.lastIndex = start;
  let djup = 0, m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith("</")) djup--;
    else if (m[0].endsWith("/>")) continue;
    else djup++;
    if (djup === 0) return m.index + m[0].length;
  }
  return -1;
}

/** Blocket som bär `data-sc-name="…"`, med start och balanserat slut. */
function scBlock(html, namn) {
  const i = html.indexOf(`data-sc-name="${namn}"`);
  if (i === -1) throw new Error(`hittade inget block ${namn} i skalet`);
  const start = html.lastIndexOf("<div", i);
  const slut = taggSlut(html, start);
  if (slut === -1) throw new Error(`kunde inte sluta blocket ${namn}`);
  return { start, slut };
}

/**
 * Byter ut det som står mellan sidhuvudet och sidfoten.
 *
 * Första försöket letade efter `</header>` och hoppade två `</div>` fram.
 * Det såg rätt ut men lämnade kvar mallsidans egen rubrik — "Kontakta
 * oss" stod kvar överst på den engelska sidan. Antalet omslag runt
 * huvudet är inget att gissa på; här räknas taggarna i stället.
 */
function bytMitten(skal, nytt) {
  const huvud = scBlock(skal, "Sidhuvud");
  const sidfot = scBlock(skal, "Sidfot");
  if (sidfot.start <= huvud.slut) throw new Error("sidfoten ligger före huvudet");
  return skal.slice(0, huvud.slut) + nytt + skal.slice(sidfot.start);
}

function sattHuvud(h) {
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${TITEL}</title>`);
  h = h.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${BESKRIVNING}">`
  );
  h = h.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${DOMAN}${ADRESS}">` +
      /* hreflang talar om för Google att de två sidorna är samma sida på
         två språk. Utan dem ser Google två sidor med liknande innehåll
         och väljer en av dem — ofta fel språk för läsaren. */
      `\n<link rel="alternate" hreflang="sv" href="${DOMAN}${SVENSK_ADRESS}">` +
      `\n<link rel="alternate" hreflang="en" href="${DOMAN}${ADRESS}">` +
      `\n<link rel="alternate" hreflang="x-default" href="${DOMAN}${SVENSK_ADRESS}">`
  );
  h = h.replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="en">`);
  h = h.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${TITEL}">`);
  h = h.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${BESKRIVNING}">`
  );
  h = h.replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${DOMAN}${ADRESS}">`
  );
  /* Sidans språk. Utan den läser skärmläsare upp engelskan med svenskt
     uttal, och Google får en signal till att sidan är svensk. */
  /* Skalet kommer från en svensk sida och har lang="sv". Attributet byts,
     det läggs inte till — två lang på samma tagg är ogiltigt. */
  h = /<html[^>]*\slang=/i.test(h)
    ? h.replace(/(<html[^>]*\s)lang="[^"]*"/i, '$1lang="en"')
    : h.replace(/<html(\s|>)/i, '<html lang="en"$1');
  return h;
}

export async function byggUtlandssidanEn(utkatalog, skalfil = "pages/kontakt.html") {
  const skal = await fs.readFile(path.join(utkatalog, skalfil), "utf8");
  let h = bytMitten(skal, innehall());
  h = sattHuvud(h);

  const fil = path.join(utkatalog, ADRESS.replace(/^\//, "") + ".html");
  await fs.mkdir(path.dirname(fil), { recursive: true });
  await fs.writeFile(fil, h, "utf8");

  return { fil: path.relative(utkatalog, fil), storlek: h.length };
}

/** hreflang och språkväxlare på den SVENSKA sidan. */
export async function kopplaSvenskaSidan(utkatalog) {
  const fil = path.join(utkatalog, SVENSK_ADRESS.replace(/^\//, "") + ".html");
  let h;
  try { h = await fs.readFile(fil, "utf8"); }
  catch { return { resultat: "svenska sidan saknas" }; }

  const fore = h;

  if (!h.includes('hreflang="en"')) {
    h = h.replace(
      /<link rel="canonical" href="[^"]*">/,
      (m) =>
        m +
        `\n<link rel="alternate" hreflang="sv" href="${DOMAN}${SVENSK_ADRESS}">` +
        `\n<link rel="alternate" hreflang="en" href="${DOMAN}${ADRESS}">` +
        `\n<link rel="alternate" hreflang="x-default" href="${DOMAN}${SVENSK_ADRESS}">`
    );
  }

  if (!h.includes("data-fp-sprakvaxel")) {
    /* Växlaren läggs först i sidans innehåll, direkt efter huvudet. */
    const huvud = scBlock(h, "Sidhuvud");
    h = h.slice(0, huvud.slut) + sprakvaxel("sv") + h.slice(huvud.slut);
  }

  if (h === fore) return { resultat: "redan kopplad" };
  await fs.writeFile(fil, h, "utf8");
  return { resultat: "hreflang och språkväxlare tillagda" };
}
