# Blog – Node commands

Run these from the **project root** (vanhie-vandaele).

## 1. Add YAML frontmatter to posts that don’t have it

```bash
node scripts/build-yaml-data.js
```

Adds `title`, `date`, `category`, `excerpt`, and `slug` to any `.md` file in `blog/posts/` that has no frontmatter. Safe to run multiple times (only touches files without YAML).

---

## 2. Generate blog list + static HTML pages

```bash
node scripts/build-blog-posts.js
```

- Updates `blog/blogs.json` (for the overview page).
- Builds one HTML file per post in `blog/<slug>.html`.
- Assigns images from `blog/img/pool/` when a post has no `image` in frontmatter.

Run this after adding or editing posts before you deploy.

---

## 3. SEO: meta descriptions + basic interlinking

```bash
node scripts/blog-seo.js
```

- **Meta descriptions:** For every post where `excerpt` is missing or empty, fills it from the first paragraph (plain text, max ~155 chars). Used as the page’s meta description.
- **Interlinking:** If the post doesn’t already link to the contact page, appends a short CTA at the end: “Neem vrijblijvend contact op voor een offerte of meer informatie.” with a link to `/contact/`.

Safe to run multiple times (only updates posts that still need an excerpt or a contact link).

**After running this,** run `node scripts/build-blog-posts.js` so the generated HTML pages and `blogs.json` get the new excerpts and meta descriptions.