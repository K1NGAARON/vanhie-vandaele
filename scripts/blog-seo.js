#!/usr/bin/env node
/**
 * 1) Fills missing meta descriptions (excerpt) from the first paragraph.
 * 2) Appends a short CTA with link to contact if the post doesn't link to /contact/ yet.
 * 3) Links first occurrence of service terms to diensten pages (doorpersing, gestuurde boring(en), bronbemaling).
 *
 * Run from project root: node scripts/blog-seo.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'blog', 'posts');
const EXCERPT_MAX_LEN = 155;
const CTA_TEXT = '\n\nNeem [vrijblijvend contact](/contact/) op voor een offerte of meer informatie.';

// Longer phrases first so "gestuurde boringen" is matched before "gestuurde boring".
const SERVICE_LINKS = [
  { phrase: 'gestuurde boringen', url: '/diensten/gestuurde-boringen/' },
  { phrase: 'gestuurde boring', url: '/diensten/gestuurde-boringen/' },
  { phrase: 'doorpersing', url: '/diensten/doorpersing/' },
  { phrase: 'bronbemaling', url: '/diensten/bronbemaling/' },
];

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content, rawFrontmatter: '' };
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
  return { meta, body: match[2], rawFrontmatter: match[1] };
}

function stripMarkdownForExcerpt(text) {
  return text
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
}

function firstParagraph(body) {
  const blocks = body.split(/\n\n+/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    return trimmed;
  }
  return blocks[0] ? blocks[0].trim() : '';
}

function generateExcerpt(body) {
  const para = firstParagraph(body);
  const plain = stripMarkdownForExcerpt(para);
  if (plain.length <= EXCERPT_MAX_LEN) return plain;
  const cut = plain.slice(0, EXCERPT_MAX_LEN - 1).trim();
  const lastSpace = cut.lastIndexOf(' ');
  const end = lastSpace > EXCERPT_MAX_LEN * 0.6 ? lastSpace : cut.length;
  return cut.slice(0, end) + ' …';
}

function needsExcerpt(meta) {
  const ex = meta.excerpt;
  return ex === undefined || ex === '' || (typeof ex === 'string' && !ex.trim());
}

function hasContactLink(body) {
  return /\]\s*\(\s*\/contact\/\s*\)|href\s*=\s*["']\/contact\/["']/i.test(body) ||
    /\]\s*\(\s*https?:\/\/[^)]*contact[^)]*\)/i.test(body);
}

function isInsideMarkdownLink(body, index) {
  const before = body.slice(0, index);
  const openBracket = before.lastIndexOf('[');
  if (openBracket === -1) return false;
  const between = body.slice(openBracket, index);
  if (between.includes('](')) {
    const afterOpen = body.slice(openBracket);
    const linkStart = afterOpen.indexOf('](');
    const urlStart = openBracket + linkStart + 2;
    const urlEnd = body.indexOf(')', urlStart);
    return index >= urlStart && index <= urlEnd;
  }
  return true;
}

function addServiceLinks(body) {
  let result = body;
  let added = 0;
  for (const { phrase, url } of SERVICE_LINKS) {
    const regex = new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    const match = result.match(regex);
    if (!match) continue;
    const firstIndex = result.toLowerCase().indexOf(phrase.toLowerCase());
    if (firstIndex === -1) continue;
    if (isInsideMarkdownLink(result, firstIndex)) continue;
    const matchedText = result.slice(firstIndex, firstIndex + phrase.length);
    const before = result.slice(0, firstIndex);
    const after = result.slice(firstIndex + phrase.length);
    const replacement = '[' + matchedText + '](' + url + ')';
    result = before + replacement + after;
    added++;
  }
  return { body: result, added };
}

function escapeYamlValue(s) {
  if (/[:\n"\\#]/.test(s)) {
    return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
  }
  return s;
}

function serializeFrontmatter(meta) {
  const order = ['title', 'date', 'category', 'excerpt', 'slug', 'image'];
  const lines = [];
  const seen = new Set();
  for (const key of order) {
    if (meta[key] !== undefined) {
      seen.add(key);
      lines.push(key + ': ' + escapeYamlValue(String(meta[key])));
    }
  }
  for (const key of Object.keys(meta)) {
    if (!seen.has(key)) lines.push(key + ': ' + escapeYamlValue(String(meta[key])));
  }
  return lines.join('\n');
}

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
let excerptCount = 0;
let ctaCount = 0;
let serviceLinkCount = 0;

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { meta, body } = parseFrontmatter(content);

  if (!meta || Object.keys(meta).length === 0) continue;

  let newBody = body;
  let changed = false;

  if (needsExcerpt(meta)) {
    meta.excerpt = generateExcerpt(body);
    excerptCount++;
    changed = true;
  }

  const { body: bodyWithServices, added: serviceAdded } = addServiceLinks(newBody);
  if (serviceAdded > 0) {
    newBody = bodyWithServices;
    serviceLinkCount += serviceAdded;
    changed = true;
  }

  if (!hasContactLink(newBody)) {
    newBody = newBody.trimEnd() + CTA_TEXT + (newBody.endsWith('\n') ? '' : '\n');
    ctaCount++;
    changed = true;
  }

  if (!changed) continue;

  const frontmatterStr = serializeFrontmatter(meta);
  const newContent = '---\n' + frontmatterStr + '\n---\n' + newBody;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Updated:', file);
}

console.log('Done. Added', excerptCount, 'meta description(s),', serviceLinkCount, 'service link(s),', ctaCount, 'CTA link(s).');
