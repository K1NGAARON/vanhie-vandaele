# Blog

Blogoverzicht en individuele berichten worden gevoed door Markdown-bestanden in `blog/posts/`.

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

3. Schrijf de inhoud eronder in Markdown.
4. Genereer de bloglijst (nodig voor de overzichtspagina):

```bash
node scripts/generate-blog-list.js
```

De overzichtspagina laadt `blog/blogs.json`; de single post laadt het `.md`-bestand via de `slug` in de URL (`/blog/post.html?slug=mijn-artikel`).

## Categorieën (voorbeelden)

- WATERPUTBORINGEN
- GEOTHERMIE
- BRONBEMALING
- GESTUURDE BORINGEN
- NIEUWS
- DOORPERSINGEN
