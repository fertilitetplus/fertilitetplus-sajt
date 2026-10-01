/**
 * Remissidorna — svensk och engelsk.
 * =================================
 *
 * Vilka sidor det är, och vilken de INTE är
 * ----------------------------------------
 * Det finns tre utlandssidor i Shopifys gamla tema, inte två:
 *
 *   /pages/provtagning-infor-behandling-utomlands   i menyn
 *       Den allmänna svenska utlandssidan: klinikkoder, delen riktad till
 *       samarbetskliniker, elva frågor. Den här filen rör den INTE.
 *
 *   /pages/fertilitetplus-x-utlandsbehandling       ej i menyn
 *   /pages/fertilitetplus-x-utlandsbehandling-en    ej i menyn
 *       Remissidorna. Två språk, samma sida. De byggs här.
 *
 * Remissidorna är landningssidor för patienter som fått länken av sin
 * klinik utomlands — de stod aldrig i någon meny, varken i huvudmenyn
 * eller i sidfoten, och ska inte göra det nu heller. Enda vägen in är
 * direktlänken, plus språkväxeln dem emellan.
 *
 * Båda låg i temamallar (`page.f-x-utlandsbehandling.json` och `…-en.json`)
 * som inte följde med till det publicerade temat. Därför visade adresserna
 * vitamindroppsinnehåll fram till 2026-10-01.
 *
 * Varför de genereras i stället för att ritas i Claude Design
 * ----------------------------------------------------------
 * De finns inte i designen och har aldrig gjort det. Att bygga dem här är
 * alltså ingen skuld mot designen, på samma sätt som
 * omdirigeringssidorna inte är det.
 *
 * Skalet — huvud, meny, sidfot, typsnitt, cookiebanner, mätning, chatt —
 * klipps ut ur en redan byggd sida. Inget av det skrivs för hand. Ändras
 * menyn i Claude Design ändras de här sidornas meny med, vid nästa bygge,
 * utan att någon behöver komma ihåg det. Bara mittpartiet är nytt.
 *
 * Innehållet är hämtat ord för ord ur det gamla temat, inte avläst ur
 * skärmbilder. Se claude/utlandssidan-innehall.md och …-en.md.
 *
 * Det som skiljer språken åt
 * --------------------------
 * Bara texten — och bokningskalendern. De två sidorna bokar mot var sin
 * kalender i patient.nu, precis som i det gamla temat. Det är medvetet
 * bevarat, inte en miss; om det ska vara en enda kalender är det ett
 * beslut för kliniken, inte för bygget.
 */

import fs from "node:fs/promises";
import path from "node:path";

const DOMAN = "https://fertilitetplus.se";

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

/* --- Innehållet, ett block per språk ------------------------------ */

export const SIDOR = {
  sv: {
    adress: "/pages/fertilitetplus-x-utlandsbehandling",
    namn: "Svenska",
    ankare: "sa-gar-det-till",
    bokning: "https://patient.nu/portal/public/calendar/290c221b-9612-435b-adaa-f28ccc6f6875#step-1",
    titel: "Provtagning och ultraljud i Sverige inför behandling utomlands | FertilitetPlus",
    beskrivning:
      "Remitterad av en klinik utomlands? Gör dina blodprover, ultraljud och spermaprov hos " +
      "FertilitetPlus i Sverige – utan att resa fram och tillbaka under behandlingen.",
    ogonbryn: "För dig som remitterats av en klinik utomlands",
    h1: "Dina ultraljud och blodprover – gjorda i Sverige",
    ingress:
      "Din klinik samarbetar med FertilitetPlus så att du kan göra din provtagning, dina " +
      "ultraljud och ditt spermaprov här i Sverige, utan att resa fram och tillbaka under " +
      "din behandling.",
    knappBoka: "Boka en konsultation",
    knappHur: "Så går det till",
    etikettHur: "Så går det till",
    rubrikHur: "Tre enkla steg",
    steg: [
      ["Boka &amp; skicka med dina prover",
       "Boka en konsultation online och skicka med provlistan/protokollet från din klinik direkt i bokningen (inte via mejl)."],
      ["Konsultation",
       "Via telefon eller på vår klinik i Stockholm går en barnmorska eller sjuksköterska igenom dina prover och planerar din provtagning."],
      ["Vi bokar &amp; remitterar",
       "Vi skriver remisser för dina blodprover och bokar ditt ultraljud. Dina provsvar levereras till dig, och du har en namngiven kontakt hela vägen."],
    ],
    etikettHjalp: "Så hjälper vi dig",
    rubrikHjalp: "Det här kan vi hjälpa dig med",
    hjalp: [
      ["Ultraljud &amp; monitorering", "Follikel- och slemhinnekontroller, utförda av läkare på vår klinik i Stockholm."],
      ["Blodprover &amp; hormoner", "Anpassat efter din cykel, med remisser till lab."],
      ["Spermaprov", "Klassiskt och utökat spermaprov för den manliga partnern – från 2 200 kr."],
      ["En namngiven kontakt", "En person med dig hela vägen – från konsultation till provsvar."],
      ["Immunologisk behandling", "Intralipid-dropp som en del av din fertilitetsbehandling, ges av barnmorska eller sjuksköterska."],
    ],
    etikettPriser: "Priser",
    rubrikPriser: "Vad det kostar",
    priser: [
      ["Konsultation vid utlandsbehandling", "Via telefon eller på kliniken · genomgång av protokoll &amp; planering", "1 200 kr"],
      ["Blodprover", "Prissätts individuellt, lämnas efter genomgång av ditt protokoll", "Tillkommer"],
      ["Ultraljud", "Follikel-/slemhinnekontroll, av läkare (Stockholm)", "1 900 kr"],
      ["Spermaprov", "För den manliga partnern · klassiskt &amp; utökat prov", "från 2 200 kr"],
      ["Intralipid-dropp", "Immunologisk behandling i form av dropp · vardag / helg", "1 600 / 2 200 kr"],
    ],
    prisnot:
      "Priser i SEK. Kostnad för blodprover och lab tillkommer och beror på vilka analyser " +
      "din klinik efterfrågar. Obs: vissa prover kan vi inte remittera (t.ex. klamydia och " +
      "cellprov).",
    etikettIntegritet: "Din integritet",
    rubrikIntegritet: "Varför lägga det i bokningen och inte via mejl?",
    integritetFet: "Dataskydd (GDPR).",
    integritetText:
      " För att skydda dina personuppgifter kan vi inte ta emot medicinska dokument via " +
      "mejl. Att lägga din provlista säkert i bokningen är det trygga och lagliga sättet – " +
      "och det gör att vi kan ta ett riktigt ansvar för din vård.",
    etikettPraktiskt: "Bra att veta",
    rubrikPraktiskt: "Praktiska detaljer",
    praktiskt: [
      ["Konsultation", "Via telefon eller på vår klinik i Stockholm, med barnmorska eller sjuksköterska."],
      ["Ultraljud", "På vår klinik i Stockholm (Värtavägen 30), utfört av läkare."],
      ["Spermaprov", "Klassiskt eller utökat spermaprov för den manliga partnern, från 2 200 kr."],
      ["Intralipid", "Intralipid-dropp, 1 600 kr (vardag) / 2 200 kr (helg). Du behöver tåla ägg och soja."],
      ["Ingen remiss behövs", "Ingen remiss och inga väntetider – boka online när som helst."],
    ],
    rubrikCta: "Redo att boka?",
    textCta:
      "Boka din konsultation online – ingen remiss och inga väntetider. Glöm inte att " +
      "bifoga ditt provprotokoll från din klinik.",
  },

  en: {
    adress: "/pages/fertilitetplus-x-utlandsbehandling-en",
    namn: "English",
    ankare: "how-it-works",
    bokning: "https://patient.nu/portal/public/calendar/a52b5984-d7b3-4ab8-96cc-ad9831820bf6#step-1",
    titel: "Tests and ultrasounds in Sweden for treatment abroad | FertilitetPlus",
    beskrivning:
      "Referred by a clinic abroad? Have your blood tests, ultrasounds and sperm " +
      "analysis done at FertilitetPlus in Sweden, without travelling back and forth.",
    ogonbryn: "For patients referred by a clinic abroad",
    h1: "Your ultrasounds and blood tests, done in Sweden",
    ingress:
      "Your clinic works with FertilitetPlus so you can have your sampling, ultrasounds and " +
      "sperm analysis here in Sweden, without travelling back and forth during your treatment.",
    knappBoka: "Book a consultation",
    knappHur: "How it works",
    etikettHur: "How it works",
    rubrikHur: "Three simple steps",
    steg: [
      ["Book &amp; attach your results",
       "Book a consultation online and attach the test list/protocol from your clinic directly in the booking (not by email)."],
      ["Consultation",
       "By phone or at our clinic in Stockholm, a midwife or nurse goes through your results and plans your sampling."],
      ["We book &amp; refer",
       "We write referrals for your blood tests and book your ultrasound. Your results are delivered to you, and you have a named contact all the way."],
    ],
    etikettHjalp: "How we help you",
    rubrikHjalp: "What we can help you with",
    hjalp: [
      ["Ultrasound &amp; monitoring", "Follicle and lining scans, carried out by a doctor at our clinic in Stockholm."],
      ["Blood tests &amp; hormones", "Tailored to your cycle, with referrals to the lab."],
      ["Sperm analysis", "Standard and extended sperm analysis for the male partner, from SEK 2,200."],
      ["A named contact", "One person with you the whole way, from consultation to results."],
      ["Immunological treatment", "Intralipid infusions as part of your fertility treatment, given by a midwife or nurse."],
    ],
    etikettPriser: "Prices",
    rubrikPriser: "What it costs",
    priser: [
      ["Consultation for treatment abroad", "By phone or at the clinic · review of protocol &amp; planning", "SEK 1,200"],
      ["Blood tests", "Priced individually, provided after review of your protocol", "Added on"],
      ["Ultrasound", "Follicle/lining scan, by a doctor (Stockholm)", "SEK 1,900"],
      ["Sperm analysis", "For the male partner · standard &amp; extended test", "from SEK 2,200"],
      ["Intralipid infusion", "Immunological treatment given as an infusion · weekday / weekend", "SEK 1,600 / 2,200"],
    ],
    prisnot:
      "Prices in SEK. The cost of blood tests and lab work is added on and depends on which " +
      "analyses your clinic requests. Please note: a few tests we are not able to refer " +
      "(for example chlamydia and cervical/cell samples).",
    etikettIntegritet: "Your privacy",
    rubrikIntegritet: "Why put it in the booking and not by email?",
    integritetFet: "Data protection (GDPR).",
    integritetText:
      " To protect your personal data, we cannot receive medical documents by email. " +
      "Putting your test list securely in the booking is the safe and lawful way – and it " +
      "lets us take real responsibility for your care.",
    etikettPraktiskt: "Good to know",
    rubrikPraktiskt: "Practical details",
    praktiskt: [
      ["Consultation", "By phone or at our clinic in Stockholm, with a midwife or nurse."],
      ["Ultrasound", "At our clinic in Stockholm (Värtavägen 30), carried out by a doctor."],
      ["Sperm analysis", "Standard or extended sperm analysis for the male partner, from SEK 2,200."],
      ["Intralipid", "Intralipid infusion, SEK 1,600 (weekday) / SEK 2,200 (weekend). You need to tolerate egg and soy."],
      ["No referral needed", "No referral and no waiting times – book online anytime."],
    ],
    rubrikCta: "Ready to book?",
    textCta:
      "Book your consultation online – no referral and no waiting times. Don't forget to " +
      "attach your test list/protocol from your clinic.",
  },
};

export const ADRESSER = [SIDOR.sv.adress, SIDOR.en.adress];

/* Ingen språkväxlare.
   Den fanns här en stund, men hör inte hemma på de här sidorna: man når
   dem bara via den länk kliniken skickar, och den länken är redan på rätt
   språk. En växel hade bjudit in besökaren att byta till ett språk hon
   inte bad om, och gjort två raka landningssidor till en liten webbplats.
   Två rena sidor i stället. Kopplingen dem emellan sker i hreflang, som
   bara Google läser. */

function innehall(sprak) {
  const d = SIDOR[sprak];

  const steg = d.steg.map(([rubrik, text], i) =>
    `<div>` +
    `<div style="width: 34px; height: 34px; border-radius: 50%; background: rgb(126, 150, 128); ` +
    `color: rgb(248, 246, 242); display: flex; align-items: center; justify-content: center; ` +
    `font-size: 14px; font-weight: 600; margin-bottom: 18px;" aria-hidden="true">${i + 1}</div>` +
    `<h3 style="${S.h3}">${rubrik}</h3><p style="${S.brod}">${text}</p></div>`
  ).join("");

  const hjalp = d.hjalp.map(([rubrik, text]) =>
    `<div style="${S.kort}"><h3 style="${S.h3}">${rubrik}</h3><p style="${S.brod}">${text}</p></div>`
  ).join("");

  const priser = d.priser.map(([namn, beskrivning, pris]) =>
    `<div style="display: flex; gap: 24px; justify-content: space-between; align-items: baseline; ` +
    `padding: 22px 0px; border-bottom: 1px solid rgb(235, 231, 225); flex-wrap: wrap;">` +
    `<div style="flex: 1 1 320px;">` +
    `<h3 style="${S.h3}">${namn}</h3>` +
    `<p style="${S.brod} font-size: 15px;">${beskrivning}</p></div>` +
    `<p style="margin: 0px; font-size: 17px; font-weight: 600; color: rgb(126, 150, 128); ` +
    `white-space: nowrap;">${pris}</p></div>`
  ).join("");

  const praktiskt = d.praktiskt.map(([namn, text]) =>
    `<div style="display: flex; gap: 32px; padding: 20px 0px; ` +
    `border-bottom: 1px solid rgb(235, 231, 225); flex-wrap: wrap;">` +
    `<h3 style="${S.h3} margin: 0px; flex: 0 0 220px;">${namn}</h3>` +
    `<p style="${S.brod} flex: 1 1 320px;">${text}</p></div>`
  ).join("");

  return (
    /* Full toppmarginal igen. Den var nedkortad till 44px för att ge plats
       åt språkväxlaren ovanför; utan den ska sidan börja som alla andra. */
    `<section style="${S.sektion}">` +
    `<p style="${S.ogonbryn}">${d.ogonbryn}</p>` +
    `<h1 style="${S.h1}">${d.h1}</h1>` +
    `<p style="${S.ingress}">${d.ingress}</p>` +
    `<div style="margin-top: 36px; display: flex; gap: 14px; flex-wrap: wrap;">` +
    `<a href="${d.bokning}" target="_blank" rel="noopener" style="${S.knappFylld}">${d.knappBoka}</a>` +
    `<a href="#${d.ankare}" style="${S.knappTom}">${d.knappHur}</a></div>` +
    `</section>` +

    `<section id="${d.ankare}" style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">${d.etikettHur}</p>` +
    `<h2 style="${S.h2}">${d.rubrikHur}</h2>` +
    `<div style="${rutnat(280)} margin-top: 32px;">${steg}</div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">${d.etikettHjalp}</p>` +
    `<h2 style="${S.h2}">${d.rubrikHjalp}</h2>` +
    `<div style="${rutnat(300)} margin-top: 32px;">${hjalp}</div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">${d.etikettPriser}</p>` +
    `<h2 style="${S.h2}">${d.rubrikPriser}</h2>` +
    `<div style="margin-top: 24px; border-top: 1px solid rgb(235, 231, 225);">${priser}</div>` +
    `<p style="${S.brod} margin-top: 28px; font-size: 15px; max-width: 52em;">${d.prisnot}</p>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">${d.etikettIntegritet}</p>` +
    `<h2 style="${S.h2}">${d.rubrikIntegritet}</h2>` +
    `<div style="border-left: 3px solid rgb(126, 150, 128); background: rgb(235, 231, 225); ` +
    `padding: 28px 32px; border-radius: 0px 4px 4px 0px; max-width: 60em;">` +
    `<p style="${S.brod}"><strong style="font-weight: 600; color: rgb(58, 53, 48);">` +
    `${d.integritetFet}</strong>${d.integritetText}</p></div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">${d.etikettPraktiskt}</p>` +
    `<h2 style="${S.h2}">${d.rubrikPraktiskt}</h2>` +
    `<div style="margin-top: 24px; border-top: 1px solid rgb(235, 231, 225);">${praktiskt}</div>` +
    `</section>` +

    `<section style="max-width: 1600px; margin: 0px auto; padding: 0px 40px 112px;">` +
    `<div style="background: rgb(126, 150, 128); color: rgb(248, 246, 242); border-radius: 4px; ` +
    `padding: 72px 40px; text-align: center;">` +
    `<h2 style="${S.h2} color: rgb(248, 246, 242); margin-bottom: 18px;">${d.rubrikCta}</h2>` +
    `<p style="margin: 0px auto 32px; font-size: 16px; font-weight: 300; line-height: 1.75; ` +
    `color: rgba(248, 246, 242, 0.88); max-width: 34em;">${d.textCta}</p>` +
    `<a href="${d.bokning}" target="_blank" rel="noopener" style="background: rgb(248, 246, 242); ` +
    `color: rgb(58, 53, 48); padding: 15px 36px; border-radius: 4px; font-size: 13px; ` +
    `font-weight: 600; letter-spacing: 0.04em; text-decoration: none; display: inline-block;">` +
    `${d.knappBoka}</a></div></section>`
  );
}

/* --- Skalet ------------------------------------------------------- */

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

function sattHuvud(h, sprak) {
  const d = SIDOR[sprak];
  const andra = sprak === "sv" ? "en" : "sv";

  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${d.titel}</title>`);
  h = h.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${d.beskrivning}">`
  );
  h = h.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${DOMAN}${d.adress}">` +
      /* hreflang talar om för Google att de två sidorna är samma sida på
         två språk. Utan dem ser Google två sidor med liknande innehåll
         och väljer en av dem — ofta fel språk för läsaren.
         x-default pekar på svenskan: sajten är svensk. */
      `\n<link rel="alternate" hreflang="sv" href="${DOMAN}${SIDOR.sv.adress}">` +
      `\n<link rel="alternate" hreflang="en" href="${DOMAN}${SIDOR.en.adress}">` +
      `\n<link rel="alternate" hreflang="x-default" href="${DOMAN}${SIDOR.sv.adress}">`
  );
  h = h.replace(
    /<meta property="og:locale" content="[^"]*">/,
    `<meta property="og:locale" content="${sprak === "sv" ? "sv_SE" : "en"}">`
  );
  h = h.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${d.titel}">`);
  h = h.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${d.beskrivning}">`
  );
  h = h.replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${DOMAN}${d.adress}">`
  );
  void andra;

  /* Sidans språk. Utan det läser skärmläsare upp engelskan med svenskt
     uttal. Skalet kommer från en svensk sida och har redan lang="sv" —
     attributet byts, det läggs inte till; två lang på samma tagg är
     ogiltigt. */
  h = /<html[^>]*\slang=/i.test(h)
    ? h.replace(/(<html[^>]*\s)lang="[^"]*"/i, `$1lang="${sprak}"`)
    : h.replace(/<html(\s|>)/i, `<html lang="${sprak}"$1`);
  return h;
}

/** Bygger en av de två sidorna. */
export async function byggUtlandssida(utkatalog, sprak, skalfil = "pages/kontakt.html") {
  const d = SIDOR[sprak];
  const skal = await fs.readFile(path.join(utkatalog, skalfil), "utf8");
  let h = bytMitten(skal, innehall(sprak));
  h = sattHuvud(h, sprak);

  const fil = path.join(utkatalog, d.adress.replace(/^\//, "") + ".html");
  await fs.mkdir(path.dirname(fil), { recursive: true });
  await fs.writeFile(fil, h, "utf8");
  return { sprak, fil: path.relative(utkatalog, fil), storlek: h.length };
}

/** Bygger båda. */
export async function byggUtlandssidorna(utkatalog, skalfil) {
  return [
    await byggUtlandssida(utkatalog, "sv", skalfil),
    await byggUtlandssida(utkatalog, "en", skalfil),
  ];
}

/**
 * Städar bort språkväxel och hreflang från en sida som inte ska ha dem.
 *
 * Behövs för /pages/provtagning-infor-behandling-utomlands: den fick dem
 * den 1 oktober, innan det stod klart att den är en egen sida och inte
 * den svenska halvan av det här paret. Den ska stå orörd.
 */
export async function taBortSprakvaxel(utkatalog, adress) {
  const fil = path.join(utkatalog, adress.replace(/^\//, "") + ".html");
  let h;
  try { h = await fs.readFile(fil, "utf8"); }
  catch { return { adress, resultat: "sidan saknas" }; }
  const fore = h;

  h = h.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, "");

  let i;
  while ((i = h.indexOf("<div data-fp-sprakvaxel")) !== -1) {
    const slut = taggSlut(h, i);
    if (slut === -1) break;
    h = h.slice(0, i) + h.slice(slut);
  }

  if (h === fore) return { adress, resultat: "redan ren" };
  await fs.writeFile(fil, h, "utf8");
  return { adress, resultat: "växel och hreflang borttagna" };
}
