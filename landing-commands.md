# Landing pages – Node commands

Run these from the **project root** (vanhie-vandaele).

## 1. Generate landing pages from JSON

```bash
node scripts/build-landing-pages.js
```

- Reads all `.json` files from **landing/pages/**.
- For each file, builds **landing/<slug>/index.html** using **landing/landing-template.html**.
- No need to maintain multiple HTML files: add or edit a JSON file and run the script.

**After adding or editing a page in landing/pages/*.json**, run this command before you deploy.

---

## 2. Adding a new landing page

1. Create a new file in **landing/pages/**, e.g. `waterputboringen-kortrijk.json`.
2. Use **landing/pages/gestuurde-boringen-in-brugge.json** as a reference. Required fields:
   - `title` – Page title (and hero title if you omit `hero.title`)
   - `slug` – URL path (e.g. `waterputboringen-kortrijk` → `/landing/waterputboringen-kortrijk/`)
   - `meta_description` – For SEO
3. Fill in `hero`, `features`, `sections`, `use_cases`, `company`, `location`, `faq`, `contact_section_title` as needed. Omit a block (or use an empty array) to hide that section.
4. Run: `node scripts/build-landing-pages.js`
5. Open **/landing/<slug>/** in the browser.

---

## 3. Template and data format

- **Template:** **landing/landing-template.html** – same header/footer as the rest of the site; placeholders like `{{TITLE}}`, `{{HERO_TITLE}}`, `{{FEATURES_HTML}}`, etc.
- **Data:** One JSON file per page in **landing/pages/**. Structure:
  - `hero`: `title`, `subtitle`, `image`, `cta_text`, `cta_url`
  - `features`: array of `{ "icon": "clock", "text": "..." }` (Font Awesome icon name without `fa-`)
  - `sections`: array of `{ "type": "text_image", "title", "body", "image", "image_left": true/false }`
  - `use_cases`: `title`, `items` (array of `{ "icon", "text" }`), `cta_text`, `cta_url`
  - `company`: `title`, `image`, `features` (array of `{ "icon", "text" }`)
  - `location`: `title`, `text`, `contact_url`, `contact_label`, `phone`, `phone_label`, `map_embed_url`
  - `faq`: `title`, `items` (array of `{ "question", "answer" }`)
  - `contact_section_title`: heading above the contact form

Optional blocks can be omitted or set to `[]` / `{}`; they will not be rendered.
