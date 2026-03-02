#!/usr/bin/env node
/**
 * Builds one static HTML file per landing page from landing/pages/*.json.
 * Run from project root: node scripts/build-landing-pages.js
 *
 * Output: landing/<slug>/index.html for each page.
 */

const fs = require('fs');
const path = require('path');

const LANDING_DIR = path.join(__dirname, '..', 'landing');
const PAGES_DIR = path.join(LANDING_DIR, 'pages');
const TEMPLATE_PATH = path.join(LANDING_DIR, 'landing-template.html');

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function iconClass(icon) {
  if (!icon) return 'fa-circle';
  const name = String(icon).replace(/^fa-/, '');
  return 'fa-' + name;
}

function buildHeroStyle(image) {
  if (!image) return '';
  return 'style="background-image: url(\'' + escapeHtml(image) + '\');"';
}

function buildHeroCta(hero) {
  const cta = hero && hero.cta_text ? hero : null;
  if (!cta) return '';
  const url = cta.cta_url || '#';
  let html = '<a href="' + escapeHtml(url) + '" class="btn landing-hero-cta">' + escapeHtml(cta.cta_text) + '</a>';
  const sec = hero && hero.cta_secondary;
  if (sec && (sec.label || sec.text)) {
    const secUrl = sec.url || 'tel:050792962';
    const secLabel = escapeHtml(sec.label || sec.text || 'Bel ons');
    html += ' <a href="' + escapeHtml(secUrl) + '" class="landing-hero-cta landing-hero-cta--secondary">';
    if (sec.icon === 'phone') html += '<i class="fa-solid fa-phone" aria-hidden="true"></i> ';
    html += secLabel + '</a>';
  }
  return html;
}

function buildHeroRating(rating) {
  if (!rating) return '';
  const text = typeof rating === 'string' ? rating : (rating.text || '');
  const score = typeof rating === 'object' && rating.score != null ? rating.score : '4.9/5';
  const stars = '★★★★★';
  return '<div class="landing-hero-rating">' + escapeHtml(text) + ' <span class="stars" aria-hidden="true">' + stars + '</span> ' + escapeHtml(score) + '</div>';
}

function buildFeaturesHtml(features) {
  if (!Array.isArray(features) || features.length === 0) return '';
  const cards = features.map((f) => {
    const icon = iconClass(f.icon);
    const text = escapeHtml((f.text || '').replace(/\n/g, ' '));
    return (
      '<div class="landing-feature-card">' +
      '<span class="landing-feature-icon"><i class="fa-solid ' + icon + '" aria-hidden="true"></i></span>' +
      '<p class="landing-feature-text">' + text + '</p>' +
      '</div>'
    );
  });
  return (
    '<section class="landing-features" id="voordelen">' +
    '<div class="landing-features-inner">' +
    cards.join('\n') +
    '</div></section>'
  );
}

function nl2br(text) {
  if (!text) return '';
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function buildSectionsHtml(sections) {
  if (!Array.isArray(sections) || sections.length === 0) return '';
  const blocks = sections.map((s) => {
    const title = escapeHtml(s.title || '');
    const body = nl2br(s.body || '');
    const img = s.image ? '<img src="' + escapeHtml(s.image) + '" alt="" loading="lazy" class="landing-section-img">' : '';
    const textBlock = '<div class="landing-section-text"><h2 class="landing-section-title">' + title + '</h2><div class="landing-section-body">' + body + '</div></div>';
    const imageBlock = '<div class="landing-section-image">' + img + '</div>';
    const left = s.image_left !== false;
    const row = left
      ? imageBlock + '\n' + textBlock
      : textBlock + '\n' + imageBlock;
    return '<div class="landing-section ' + (left ? 'landing-section--image-left' : 'landing-section--image-right') + '"><div class="landing-section-inner">' + row + '</div></div>';
  });
  return '<section class="landing-sections">' + blocks.join('\n') + '</section>';
}

function buildUseCasesHtml(useCases) {
  if (!useCases || !Array.isArray(useCases.items) || useCases.items.length === 0) return '';
  const title = escapeHtml(useCases.title || '');
  const cards = useCases.items.map((item) => {
    const icon = iconClass(item.icon);
    const text = nl2br(item.text || '');
    return (
      '<div class="landing-usecase-card">' +
      '<span class="landing-usecase-icon"><i class="fa-solid ' + icon + '" aria-hidden="true"></i></span>' +
      '<p class="landing-usecase-text">' + text + '</p>' +
      '</div>'
    );
  });
  let ctaHtml = '';
  if (useCases.cta_text) {
    const ctaUrl = useCases.cta_url || '/contact/';
    ctaHtml = '<a href="' + escapeHtml(ctaUrl) + '" class="btn landing-usecase-cta">' + escapeHtml(useCases.cta_text) + '</a>';
  }
  return (
    '<section class="landing-usecases">' +
    '<div class="landing-usecases-inner">' +
    '<h2 class="landing-usecases-title">' + title + '</h2>' +
    '<div class="landing-usecases-grid">' + cards.join('\n') + '</div>' +
    (ctaHtml ? '<div class="landing-usecases-cta">' + ctaHtml + '</div>' : '') +
    '</div></section>'
  );
}

function buildCompanyHtml(company) {
  if (!company) return '';
  const title = escapeHtml(company.title || '');
  const img = company.image
    ? '<img src="' + escapeHtml(company.image) + '" alt="" loading="lazy" class="landing-company-img">'
    : '';
  const features = Array.isArray(company.features) ? company.features : [];
  const cards = features.map((f) => {
    const icon = iconClass(f.icon);
    const text = escapeHtml((f.text || '').replace(/\n/g, ' '));
    return (
      '<div class="landing-company-card">' +
      '<span class="landing-company-card-icon"><i class="fa-solid ' + icon + '" aria-hidden="true"></i></span>' +
      '<p class="landing-company-card-text">' + text + '</p>' +
      '</div>'
    );
  });
  return (
    '<section class="landing-company">' +
    '<div class="landing-company-inner">' +
    '<h2 class="landing-company-title">' + title + '</h2>' +
    (img ? '<div class="landing-company-image">' + img + '</div>' : '') +
    (cards.length ? '<div class="landing-company-features">' + cards.join('\n') + '</div>' : '') +
    '</div></section>'
  );
}

function buildLocationHtml(location) {
  if (!location) return '';
  const title = escapeHtml(location.title || '');
  const text = nl2br(location.text || '');
  const contactUrl = location.contact_url || '/contact/';
  const contactLabel = escapeHtml(location.contact_label || 'Contacteer Ons');
  const phone = location.phone || '';
  const phoneLabel = escapeHtml(location.phone_label || 'Bel Ons');
  const phoneHtml = phone ? '<a href="tel:' + escapeHtml(phone.replace(/\s/g, '')) + '" class="btn landing-location-btn">' + phoneLabel + '</a>' : '';
  const mapUrl = location.map_embed_url || '';
  const mapHtml = mapUrl
    ? '<iframe src="' + escapeHtml(mapUrl) + '" width="100%" height="200" style="border:0;" allowfullscreen="" loading="lazy" title="Kaart"></iframe>'
    : '';
  return (
    '<section class="landing-location">' +
    '<div class="landing-location-inner">' +
    '<h2 class="landing-location-title">' + title + '</h2>' +
    '<div class="landing-location-content">' +
    '<div class="landing-location-text">' +
    '<div class="landing-location-body">' + text + '</div>' +
    '<div class="landing-location-buttons">' +
    '<a href="' + escapeHtml(contactUrl) + '" class="btn landing-location-btn">' + contactLabel + '</a>' +
    phoneHtml +
    '</div></div>' +
    (mapHtml ? '<div class="landing-location-map">' + mapHtml + '</div>' : '') +
    '</div></div></section>'
  );
}

function buildFaqHtml(faq) {
  if (!faq || !Array.isArray(faq.items) || faq.items.length === 0) return '';
  const title = escapeHtml(faq.title || 'Veelgestelde vragen');
  const items = faq.items.map((item, i) => {
    const q = escapeHtml(item.question || '');
    const a = nl2br(item.answer || '');
    const id = 'faq-' + i;
    return (
      '<div class="landing-faq-item">' +
      '<button type="button" class="landing-faq-question" aria-expanded="false" aria-controls="' + id + '" data-faq-toggle>' +
      '<span>' + q + '</span><i class="fa-solid fa-chevron-down landing-faq-icon" aria-hidden="true"></i>' +
      '</button>' +
      '<div class="landing-faq-answer" id="' + id + '" hidden><div class="landing-faq-answer-inner">' + a + '</div></div>' +
      '</div>'
    );
  });
  return (
    '<section class="landing-faq">' +
    '<div class="landing-faq-inner">' +
    '<h2 class="landing-faq-title">' + title + '</h2>' +
    '<div class="landing-faq-list">' + items.join('\n') + '</div>' +
    '</div></section>'
  );
}

function buildPage(data) {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const hero = data.hero || {};
  const heroStyle = buildHeroStyle(hero.image);
  const heroCtaHtml = buildHeroCta(hero);
  const heroRatingHtml = buildHeroRating(hero.rating);
  const featuresHtml = buildFeaturesHtml(data.features);
  const sectionsHtml = buildSectionsHtml(data.sections);
  const useCasesHtml = buildUseCasesHtml(data.use_cases);
  const companyHtml = buildCompanyHtml(data.company);
  const locationHtml = buildLocationHtml(data.location);
  const faqHtml = buildFaqHtml(data.faq);
  const contactTitle = escapeHtml(data.contact_section_title || 'Neem contact op voor een vrijblijvende offerte');

  return template
    .replace(/\{\{TITLE\}\}/g, escapeHtml(data.title || 'Landing'))
    .replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(data.meta_description || ''))
    .replace(/\{\{HERO_TITLE\}\}/g, escapeHtml(hero.title || data.title || ''))
    .replace(/\{\{HERO_SUBTITLE\}\}/g, escapeHtml((hero.subtitle || '').replace(/\n/g, ' ')))
    .replace(/\{\{HERO_STYLE\}\}/g, heroStyle)
    .replace(/\{\{HERO_CTA_HTML\}\}/g, heroCtaHtml)
    .replace(/\{\{HERO_RATING_HTML\}\}/g, heroRatingHtml)
    .replace(/\{\{FEATURES_HTML\}\}/g, featuresHtml)
    .replace(/\{\{SECTIONS_HTML\}\}/g, sectionsHtml)
    .replace(/\{\{USE_CASES_HTML\}\}/g, useCasesHtml)
    .replace(/\{\{COMPANY_HTML\}\}/g, companyHtml)
    .replace(/\{\{LOCATION_HTML\}\}/g, locationHtml)
    .replace(/\{\{FAQ_HTML\}\}/g, faqHtml)
    .replace(/\{\{CONTACT_SECTION_TITLE\}\}/g, contactTitle);
}

// Main
if (!fs.existsSync(PAGES_DIR)) {
  console.log('No landing/pages directory found. Create landing/pages/ and add .json files.');
  process.exit(0);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json'));
let generated = 0;

for (const file of files) {
  const slug = path.basename(file, '.json');
  const jsonPath = path.join(PAGES_DIR, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (e) {
    console.warn('Skip', file, '- invalid JSON:', e.message);
    continue;
  }
  if (!data.slug) data.slug = slug;
  const html = buildPage(data);
  const outDir = path.join(LANDING_DIR, data.slug);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  generated++;
  console.log('Generated: ' + data.slug + '/index.html');
}

console.log('Done. Generated', generated, 'landing page(s).');
