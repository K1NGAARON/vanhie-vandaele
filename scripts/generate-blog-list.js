#!/usr/bin/env node
/**
 * Reads all .md files in blog/posts/, extracts YAML frontmatter,
 * and writes blog/blogs.json for the overview page.
 *
 * Run from project root: node scripts/generate-blog-list.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'blog', 'posts');
const OUTPUT_FILE = path.join(__dirname, '..', 'blog', 'blogs.json');

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

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
const posts = [];

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { meta } = parseFrontmatter(content);
  const slug = meta.slug || path.basename(file, '.md');
  posts.push({
    slug,
    title: meta.title || 'Untitled',
    date: meta.date || '',
    category: meta.category || 'NIEUWS',
    excerpt: meta.excerpt || '',
    image: meta.image || '',
  });
}

// Sort by date descending
posts.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2), 'utf8');
console.log('Generated', OUTPUT_FILE, 'with', posts.length, 'posts.');
