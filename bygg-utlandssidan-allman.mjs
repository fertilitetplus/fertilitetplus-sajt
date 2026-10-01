/**
 * Den allmänna utlandssidan — /pages/provtagning-infor-behandling-utomlands
 * =========================================================================
 *
 * Det här är sidan menyvalet "IVF & utlandsbehandlingar" leder till.
 *
 * VIKTIGT: till skillnad från remissidorna FINNS den här sidan i Claude
 * Design. Att den byggs här är därför en **skuld**, inte ett undantag.
 * Designen och sajten visar inte samma sak förrän innehållet nedan är
 * inlagt i Claude Design. Se claude/andringar-i-claude-design.md.
 *
 * Varför den byggs här ändå
 * -------------------------
 * Sidan i Claude Design hade med tiden fått ett annat innehåll än det som
 * ska stå: klinikkoder med rabatt och en hel del riktad till
 * samarbetskliniker. Marie pekade ut rätt version genom en
 * förhandsgranskningslänk till Shopify-temat, och den versionen är den
 * som står nedan — ord för ord, hämtad ur förhandsgranskningen och ur
 * claude/utlandssidan-innehall.md (som har svaren på frågorna, de ligger
 * hopfällda på skärmen).
 *
 * Det som försvann i och med bytet, och som inte finns någon annanstans
 * på sajten: klinikkoderna (10 % rabatt, exempel "Trianglen10"), kravet
 * att kliniken informerar patienten före remiss, hela delen "Remittera
 * dina patienter för uppföljning i Sverige" med vägledande priser och två
 * PDF:er, samt fyra av elva frågor. Beslutet är Maries och togs med den
 * listan framför sig.
 *
 * Skalet — huvud, meny, sidfot, typsnitt, cookiebanner, mätning, chatt —
 * klipps ut ur en redan byggd sida, precis som för remissidorna. Bara
 * mittpartiet är nytt, och stilvokabulären delas med dem.
 *
 * Bokningen
 * ---------
 * Sidan bokade tidigare mot kalender dbd1fde4…. Förhandsgranskningen
 * bokar mot 290c221b…, samma kalender som den svenska remissidan, och det
 * är den som gäller här. Att det finns tre kalendrar för utlandsbehandling
 * är en öppen fråga för kliniken — se claude/utlandssidan.md.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { S, rutnat, bytMitten } from "./bygg-utlandssidorna.mjs";

const DOMAN = "https://fertilitetplus.se";

export const ADRESS = "/pages/provtagning-infor-behandling-utomlands";

const BOKNING =
  "https://patient.nu/portal/public/calendar/290c221b-9612-435b-adaa-f28ccc6f6875#step-1";

const TITEL = "Fertilitetsbehandling utomlands – FertilitetPlus";
const BESKRIVNING =
  "Vi hjälper dig med bl.a. ultraljudskontroller och blodprover i samband med din " +
  "fertilitetsbehandling utomlands. Boka en konsultation hos FertilitetPlus idag!";

/* --- Innehållet, ord för ord ur förhandsgranskningen --------------- */

const STEG = [
  ["Boka konsultation",
   "Boka din konsultation och skicka med listan/protokollet på de prover din klinik efterfrågar direkt i bokningen – inte via mejl."],
  ["Konsultation &amp; genomgång",
   "En barnmorska går igenom dina prover och planerar tillsammans med dig, på kliniken eller via telefon."],
  ["Betalning &amp; remiss",
   "Efter genomförd konsultation utfärdas remiss för provtagning i Sverige och eventuell bokning av ultraljud."],
  ["Provtagning",
   "Du går sedan till anvisat laboratorium för att lämna dina prover."],
];

const HJALP = [
  ["Ultraljud &amp; monitorering",
   "Ultraljudskontroller och uppföljning i samband med din behandling utomlands."],
  ["Blodprover &amp; remisser",
   "Vi skriver svenska remisser för de prover din klinik efterfrågar och koordinerar provtagningen."],
  ["Immunologisk behandling",
   "Intralipid-dropp och annan immunologisk behandling som en del av din fertilitetsbehandling."],
  ["Barnmorska &amp; vägledning",
   "Konsultation med barnmorska, samt stöd och vägledning inför behandlingen."],
];

const PRISER = [
  ["Konsultation vid utlandsbehandling",
   "På kliniken eller via telefon · genomgång av protokoll &amp; planering. Kostnad för själva proverna tillkommer.",
   "1 200 kr"],
  ["Ultraljud", "Kontroll och uppföljning, utfört av läkare", "1 900 kr"],
  ["Spermaprov (klassiskt)", "För den manliga partnern", "2 200 kr"],
  ["Utökat spermaprov", "Utökad analys där även mätning av oxidativ stress ingår", "3 800 kr"],
  ["Intralipid-dropp", "Immunologisk behandling i form av dropp · vardag / helg", "1 600 / 2 200 kr"],
];

const PROVER = [
  "AMH", "TSH", "FSH/LH", "Vitamin D", "HIV/Hepatit",
  "Koagulationsprover", "Immunologiska prover",
];

const PRAKTISKT = [
  ["Konsultation", "På kliniken eller via telefon, med barnmorska."],
  ["Var vi finns",
   "Vi tar emot i Stockholm och Göteborg. Alla tjänster erbjuds inte på båda orterna – du ser vad som finns var när du bokar."],
  ["Ta med dig", "Ditt provprotokoll läggs i bokningen. Ta med giltig legitimation."],
  ["Ingen väntetid", "Ingen remiss krävs för att boka – boka online när som helst."],
];

const FRAGOR = [
  ["Vilka kliniker samarbetar ni med?",
   "Vi har erfarenhet av de vanligaste provprotokollen från internationella fertilitetskliniker, bland annat Trianglen Fertility Clinic, O.L.G.A Fertility Clinic och Life Clinic."],
  ["Kan ni hjälpa mig även om min klinik inte finns med?",
   "Ja. Vi hjälper även patienter från andra fertilitetskliniker utomlands. Skicka med ditt provprotokoll i bokningen så gör vi en bedömning."],
  ["Hur vet jag vilka prover jag behöver ta?",
   "Din fertilitetsklinik skickar vanligtvis ett provprotokoll eller en lista med analyser som behöver tas. Vi hjälper dig att gå igenom underlaget inför remisskrivningen."],
  ["Hur lång tid tar processen?",
   "Efter genomförd konsultation och betalning skickas remissen vanligtvis inom kort. Därefter kan du boka eller besöka laboratorium för provtagning."],
  ["Kan ni hjälpa till att tolka mina provsvar?",
   "Medicinsk rådgivning och bedömning av provsvar görs av ansvarig läkare på din fertilitetsklinik. FertilitetPlus hjälper till med remisshantering och koordinering av provtagning."],
  ["Kan jag göra ultraljud hos er inför min behandling?",
   "Ja, vi erbjuder ultraljud i samband med fertilitetsbehandling och hjälper många patienter som behandlas utomlands med uppföljning och monitorering i Sverige. Pris för ultraljud är 1 900 kr."],
  ["Kan jag kombinera flera tjänster vid samma besök?",
   "I många fall går det bra att kombinera exempelvis ultraljud, konsultation och provtagning. Du bokar enkelt behandlingarna efter varandra själv här på hemsidan."],
];

/* --- Mittpartiet --------------------------------------------------- */

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

  const prover = PROVER.map((p) =>
    `<li style="display: inline-block; margin: 0px 8px 8px 0px; padding: 7px 14px; ` +
    `background: rgb(235, 231, 225); border-radius: 999px; font-size: 14px; ` +
    `color: rgba(58, 53, 48, 0.8);">${p}</li>`
  ).join("");

  const praktiskt = PRAKTISKT.map(([namn, text]) =>
    `<div style="display: flex; gap: 32px; padding: 20px 0px; ` +
    `border-bottom: 1px solid rgb(235, 231, 225); flex-wrap: wrap;">` +
    `<h3 style="${S.h3} margin: 0px; flex: 0 0 220px;">${namn}</h3>` +
    `<p style="${S.brod} flex: 1 1 320px;">${text}</p></div>`
  ).join("");

  /* <details> i stället för en egen utfällning: inbyggt i webbläsaren,
     fungerar utan JavaScript, går att nå med tangentbord, och Google
     läser svaret även när det är hopfällt. */
  const fragor = FRAGOR.map(([fraga, svar]) =>
    `<details style="border-bottom: 1px solid rgb(235, 231, 225);" data-fp-fraga>` +
    `<summary style="${S.h3} margin: 0px; padding: 20px 0px; cursor: pointer; ` +
    `list-style: none; display: flex; justify-content: space-between; gap: 24px; ` +
    `align-items: center;">${fraga}` +
    `<span aria-hidden="true" style="color: rgb(126, 150, 128); font-size: 20px; ` +
    `font-weight: 300; flex: none;">+</span></summary>` +
    `<p style="${S.brod} padding: 0px 0px 22px; max-width: 52em;">${svar}</p></details>`
  ).join("");

  return (
    `<section style="${S.sektion}">` +
    `<p style="${S.ogonbryn}">IVF &amp; utlandsbehandlingar</p>` +
    `<h1 style="${S.h1}">Provtagning och kontroller inför din behandling utomlands</h1>` +
    `<p style="${S.ingress}">Ska du genomgå fertilitetsbehandling utomlands behöver du ofta ` +
    `göra vissa undersökningar först. Hos FertilitetPlus tar du dina ultraljud, blodprover ` +
    `och andra kontroller här i Sverige – så slipper du resa fram och tillbaka till kliniken ` +
    `utomlands. Vi hjälper dig inför bland annat provrörsbefruktning (IVF), äggdonation och ` +
    `embryodonation.</p>` +
    `<div style="margin-top: 36px; display: flex; gap: 14px; flex-wrap: wrap;">` +
    `<a href="${BOKNING}" target="_blank" rel="noopener" style="${S.knappFylld}">Boka en konsultation</a>` +
    `<a href="#sa-gar-det-till" style="${S.knappTom}">Så går det till</a></div>` +
    `</section>` +

    `<section id="sa-gar-det-till" style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">Så går det till</p>` +
    `<h2 style="${S.h2}">Fyra enkla steg</h2>` +
    `<div style="${rutnat(260)} margin-top: 32px;">${steg}</div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">Så hjälper vi dig</p>` +
    `<h2 style="${S.h2}">Det här kan vi hjälpa dig med</h2>` +
    `<div style="${rutnat(300)} margin-top: 32px;">${hjalp}</div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">Priser</p>` +
    `<h2 style="${S.h2}">Vad det kostar</h2>` +
    `<div style="margin-top: 24px; border-top: 1px solid rgb(235, 231, 225);">${priser}</div>` +
    `<p style="${S.brod} margin-top: 28px; font-size: 15px; max-width: 52em;">Priser i SEK. ` +
    `Kostnaden för prover varierar beroende på vilka analyser din klinik efterfrågar och ` +
    `lämnas individuellt under din konsultation.</p>` +
    `<p style="${S.brod} margin-top: 24px; font-size: 15px; font-weight: 600; ` +
    `color: rgb(58, 53, 48);">Exempel på prover vi ofta hjälper till med:</p>` +
    `<ul style="margin: 12px 0px 0px; padding: 0px; list-style: none;">${prover}</ul>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">Bra att känna till</p>` +
    `<h2 style="${S.h2}">Varför lägga det i bokningen och inte via mejl?</h2>` +
    `<div style="border-left: 3px solid rgb(126, 150, 128); background: rgb(235, 231, 225); ` +
    `padding: 28px 32px; border-radius: 0px 4px 4px 0px; max-width: 60em;">` +
    `<p style="${S.brod} margin-bottom: 16px;"><strong style="font-weight: 600; ` +
    `color: rgb(58, 53, 48);">Dataskydd (GDPR).</strong> För att skydda dina personuppgifter ` +
    `kan vi inte ta emot medicinska dokument via mejl. Att lägga ditt provprotokoll säkert i ` +
    `bokningen är det trygga och lagliga sättet – och det gör att vi kan ta ett riktigt ansvar ` +
    `för din vård.</p>` +
    `<p style="${S.brod}"><strong style="font-weight: 600; color: rgb(58, 53, 48);">Vår roll.` +
    `</strong> FertilitetPlus hjälper till med remisshantering och koordinering av provtagning. ` +
    `All medicinsk rådgivning, bedömning och tolkning av provsvar görs av ansvarig läkare på ` +
    `kliniken där behandlingen genomförs.</p></div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">Praktiskt</p>` +
    `<h2 style="${S.h2}">Bra att veta</h2>` +
    `<div style="margin-top: 24px; border-top: 1px solid rgb(235, 231, 225);">${praktiskt}</div>` +
    `</section>` +

    `<section style="${S.sektionTat}">` +
    `<p style="${S.ogonbryn}">Frågor &amp; svar</p>` +
    `<h2 style="${S.h2}">Behöver du hjälp?</h2>` +
    `<div style="margin-top: 24px; border-top: 1px solid rgb(235, 231, 225); max-width: 68em;">` +
    `${fragor}</div>` +
    `</section>` +

    `<section style="max-width: 1600px; margin: 0px auto; padding: 0px 40px 112px;">` +
    `<div style="background: rgb(126, 150, 128); color: rgb(248, 246, 242); border-radius: 4px; ` +
    `padding: 72px 40px; text-align: center;">` +
    `<h2 style="${S.h2} color: rgb(248, 246, 242); margin-bottom: 18px;">Redo att boka?</h2>` +
    `<p style="margin: 0px auto 32px; font-size: 16px; font-weight: 300; line-height: 1.75; ` +
    `color: rgba(248, 246, 242, 0.88); max-width: 34em;">Boka din konsultation online – ingen ` +
    `remiss och inga väntetider. Glöm inte att bifoga ditt provprotokoll från din klinik.</p>` +
    `<a href="${BOKNING}" target="_blank" rel="noopener" style="background: rgb(248, 246, 242); ` +
    `color: rgb(58, 53, 48); padding: 15px 36px; border-radius: 4px; font-size: 13px; ` +
    `font-weight: 600; letter-spacing: 0.04em; text-decoration: none; display: inline-block;">` +
    `Boka en konsultation</a></div></section>`
  );
}

function sattHuvud(h) {
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${TITEL}</title>`);
  h = h.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${BESKRIVNING}">`
  );
  h = h.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${DOMAN}${ADRESS}">`
  );
  h = h.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${TITEL}">`);
  h = h.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${BESKRIVNING}">`
  );
  h = h.replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${DOMAN}${ADRESS}">`
  );
  return h;
}

export async function byggAllmannaUtlandssidan(utkatalog, skalfil = "pages/kontakt.html") {
  const skal = await fs.readFile(path.join(utkatalog, skalfil), "utf8");
  let h = bytMitten(skal, innehall());
  h = sattHuvud(h);

  const fil = path.join(utkatalog, ADRESS.replace(/^\//, "") + ".html");
  await fs.writeFile(fil, h, "utf8");
  return { fil: path.relative(utkatalog, fil), storlek: h.length };
}
