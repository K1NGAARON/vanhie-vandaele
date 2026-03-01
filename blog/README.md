# Blog

Het blog bestaat uit gewone HTML-pagina’s. Elk artikel heeft een eigen bestand (geen slug of query string).

## Nieuw artikel toevoegen

1. Maak een nieuw bestand in `blog/posts/` met een korte, unieke bestandsnaam (bijv. `mijn-artikel.md`).
2. Gebruik YAML frontmatter bovenaan het bestand:

```yaml
---
title: Titel van het artikel
date: 2026-03-01
category: WATERPUTBORINGEN
excerpt: Korte samenvatting voor de kaart en zoekmachines.
image: /pad/naar/afbeelding.jpg
slug: mijn-artikel
---
```

3. Schrijf de inhoud eronder in Markdown (koppen, vet, lijsten, links).
4. Genereer de overzichtslijst én de HTML-pagina’s:

```bash
node scripts/build-blog-posts.js
```

Dit script maakt `blog/blogs.json` (voor de overzichtspagina) en voor elk artikel een aparte pagina `blog/<slug>.html`, bijvoorbeeld `blog/mijn-artikel.html`. Die bestanden kun je gewoon deployen; er is geen JavaScript nodig om een artikel te tonen.

## Afbeeldingen (optioneel)

Plaats 6–7 afbeeldingen in **blog/img/pool/** (jpg, png of webp). Bij het bouwen wordt voor elk artikel **zonder** `image` in de frontmatter automatisch een vaste afbeelding uit deze map gekozen (op basis van de slug). Die afbeelding wordt gebruikt voor de blogkaart op het overzicht én voor de hero op de artikelpagina. Als je voor een artikel toch een eigen afbeelding wilt, zet dan `image: /pad/naar/afbeelding.jpg` in de frontmatter.

## Bestanden

- **blog/index.html** – Overzichtspagina (laadt `blogs.json` en toont kaarten met links naar `slug.html`).
- **blog/post-template.html** – Sjabloon voor elke artikelpagina (niet handmatig bewerken; wordt door het buildscript gebruikt).
- **blog/posts/*.md** – Brontekst van de artikelen.
- **blog/<slug>.html** – Gegenereerde artikelpagina’s (na `node scripts/build-blog-posts.js`).
- **blog/img/pool/** – Map met 6–7 afbeeldingen voor automatische kaart- en hero-afbeeldingen (zie hierboven).

## Categorieën (voorbeelden)

- WATERPUTBORINGEN
- GEOTHERMIE
- BRONBEMALING
- GESTUURDE BORINGEN
- NIEUWS
- DOORPERSINGEN
