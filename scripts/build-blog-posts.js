#!/usr/bin/env node
/**
 * Builds one static HTML file per blog post from blog/posts/*.md.
 * Run from project root: node scripts/build-blog-posts.js
 *
 * Also runs generate-blog-list.js so blogs.json is up to date.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const TEMPLATE_PATH = path.join(BLOG_DIR, 'post-template.html');

const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
];

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  const lines = match[1].split(/\r?\n/);
  for (const line of lines) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"');
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1).replace(/\\'/g, "'");
    meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function markdownToHtml(md) {
  if (!md) return '';
  const lines = md.split(/\r?\n/);
  const out = [];
  let i = 0;
  let inList = false;

  function flushList(items) {
    if (items.length === 0) return;
    out.push('<ul>');
    items.forEach((item) => out.push('<li>' + inlineMd(item) + '</li>'));
    out.push('</ul>');
  }

  function inlineMd(text) {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      if (inList) { flushList(listItems); listItems = []; inList = false; }
      out.push('<h3>' + inlineMd(trimmed.slice(4)) + '</h3>');
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { flushList(listItems); listItems = []; inList = false; }
      out.push('<h2>' + inlineMd(trimmed.slice(3)) + '</h2>');
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) { flushList(listItems); listItems = []; inList = false; }
      out.push('<h2>' + inlineMd(trimmed.slice(2)) + '</h2>');
      i++;
      continue;
    }
    if (trimmed.startsWith('- ')) {
      if (inList) {
        listItems.push(trimmed.slice(2));
      } else {
        listItems = [trimmed.slice(2)];
        inList = true;
      }
      i++;
      continue;
    }

    if (inList) {
      flushList(listItems);
      listItems = [];
      inList = false;
    }

    if (trimmed === '') {
      i++;
      continue;
    }

    out.push('<p>' + inlineMd(trimmed) + '</p>');
    i++;
  }

  if (inList) flushList(listItems);
  return out.join('\n');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.getDate() + ' ' + MONTHS_NL[d.getMonth()] + ' ' + d.getFullYear();
}

function shortTitle(title, maxLen = 45) {
  if (title.length <= maxLen) return escapeHtml(title);
  return escapeHtml(title.slice(0, maxLen).trim() + '…');
}

function cardHtml(post, postUrl) {
  const dateFormatted = formatDate(post.date);
  return (
    '<article class="blog-card">' +
    '<div class="blog-card-image-wrap">' +
    '<a href="' + escapeHtml(postUrl) + '"><img src="' + escapeHtml(post.image || '') + '" alt="" loading="lazy"></a>' +
    '<span class="blog-card-category">' + escapeHtml(post.category) + '</span>' +
    '</div>' +
    '<div class="blog-card-body">' +
    '<time class="blog-card-date">' + escapeHtml(dateFormatted) + '</time>' +
    '<h2 class="blog-card-title"><a href="' + escapeHtml(postUrl) + '">' + escapeHtml(post.title) + '</a></h2>' +
    '<p class="blog-card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
    '<a href="' + escapeHtml(postUrl) + '" class="blog-card-link">Lees verder →</a>' +
    '</div>' +
    '</article>'
  );
}

// Load all posts (same logic as generate-blog-list.js)
require('./generate-blog-list.js');

const listPath = path.join(BLOG_DIR, 'blogs.json');
const posts = JSON.parse(fs.readFileSync(listPath, 'utf8'));

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
const categoriesHtml = categories
  .map((c) => '<a href="/blog/">' + escapeHtml(c) + '</a>')
  .join('\n');

let generated = 0;
for (const post of posts) {
  const slug = post.slug;
  const mdPath = path.join(POSTS_DIR, slug + '.md');
  if (!fs.existsSync(mdPath)) {
    console.warn('Skip (no .md):', slug);
    continue;
  }

  const content = fs.readFileSync(mdPath, 'utf8');
  const { meta, body } = parseFrontmatter(content);
  const contentHtml = markdownToHtml(body);

  const title = meta.title || post.title || 'Blog';
  const dateFormatted = formatDate(meta.date || post.date);
  const breadcrumbTitle = shortTitle(title);

  const related = posts.filter((p) => p.slug !== slug).slice(0, 3);
  const relatedHtml = related
    .map((p) => cardHtml(p, p.slug + '.html'))
    .join('\n');

  let html = template
    .replace(/\{\{TITLE\}\}/g, escapeHtml(title))
    .replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(meta.excerpt || post.excerpt || ''))
    .replace(/\{\{BREADCRUMB_TITLE\}\}/g, breadcrumbTitle)
    .replace(/\{\{HERO_TITLE\}\}/g, escapeHtml(title))
    .replace(/\{\{DATE\}\}/g, escapeHtml(dateFormatted))
    .replace(/\{\{CONTENT_HTML\}\}/g, contentHtml)
    .replace(/\{\{CATEGORIES_HTML\}\}/g, categoriesHtml)
    .replace(/\{\{RELATED_HTML\}\}/g, relatedHtml);

  const outPath = path.join(BLOG_DIR, slug + '.html');
  fs.writeFileSync(outPath, html, 'utf8');
  generated++;
  console.log('Generated:', slug + '.html');
}

console.log('Done. Generated', generated, 'post page(s).');
