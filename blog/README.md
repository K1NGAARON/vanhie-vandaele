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

## Bestanden

- **blog/index.html** – Overzichtspagina (laadt `blogs.json` en toont kaarten met links naar `slug.html`).
- **blog/post-template.html** – Sjabloon voor elke artikelpagina (niet handmatig bewerken; wordt door het buildscript gebruikt).
- **blog/posts/*.md** – Brontekst van de artikelen.
- **blog/<slug>.html** – Gegenereerde artikelpagina’s (na `node scripts/build-blog-posts.js`).

## Categorieën (voorbeelden)

- WATERPUTBORINGEN
- GEOTHERMIE
- BRONBEMALING
- GESTUURDE BORINGEN
- NIEUWS
- DOORPERSINGEN
