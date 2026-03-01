#!/usr/bin/env node
/**
 * Adds YAML frontmatter to any .md file in blog/posts/ that doesn't have it.
 * Run from project root: node scripts/build-yaml-data.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'blog', 'posts');

function hasFrontmatter(content) {
  if (!content || typeof content !== 'string') return false;
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) return false;
  const second = trimmed.indexOf('\n---', 3);
  return second !== -1;
}

function slugToTitle(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function buildFrontmatter(slug) {
  const title = slugToTitle(slug);
  return [
    '---',
    'title: ' + title,
    'date: ' + todayISO(),
    'category: NIEUWS',
    'excerpt: ""',
    'slug: ' + slug,
    '---',
    ''
  ].join('\n');
}

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
let updated = 0;

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  if (hasFrontmatter(content)) {
    continue;
  }

  const slug = path.basename(file, '.md');
  const frontmatter = buildFrontmatter(slug);
  const newContent = frontmatter + content.trimStart() + (content.endsWith('\n') ? '' : '\n');
  fs.writeFileSync(filePath, newContent, 'utf8');
  updated++;
  console.log('Added frontmatter:', file);
}

console.log('Done. Updated', updated, 'file(s).');
