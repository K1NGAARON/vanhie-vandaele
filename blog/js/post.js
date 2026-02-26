(function () {
  const MONTHS_NL = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ];

  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    return params.get('slug') || '';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.getDate() + ' ' + MONTHS_NL[d.getMonth()] + ' ' + d.getFullYear();
  }

  function parseFrontmatter(text) {
    var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: text };
    var meta = {};
    var lines = match[1].split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var colon = line.indexOf(':');
      if (colon === -1) continue;
      var key = line.slice(0, colon).trim();
      var value = line.slice(colon + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"');
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1).replace(/\\'/g, "'");
      meta[key] = value;
    }
    return { meta: meta, body: match[2].trim() };
  }

  function shortTitle(title, maxLen) {
    maxLen = maxLen || 45;
    if (title.length <= maxLen) return title;
    return title.slice(0, maxLen).trim() + '…';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderRelatedCard(post) {
    var postUrl = '/blog/post.html?slug=' + encodeURIComponent(post.slug);
    var dateFormatted = formatDate(post.date);
    return (
      '<article class="blog-card">' +
        '<div class="blog-card-image-wrap">' +
          '<a href="' + postUrl + '"><img src="' + escapeHtml(post.image || '') + '" alt="" loading="lazy"></a>' +
          '<span class="blog-card-category">' + escapeHtml(post.category) + '</span>' +
        '</div>' +
        '<div class="blog-card-body">' +
          '<time class="blog-card-date">' + escapeHtml(dateFormatted) + '</time>' +
          '<h2 class="blog-card-title"><a href="' + postUrl + '">' + escapeHtml(post.title) + '</a></h2>' +
          '<p class="blog-card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
          '<a href="' + postUrl + '" class="blog-card-link">Lees verder →</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderCategories(categories) {
    return categories.map(function (cat) {
      return '<a href="/blog/">' + escapeHtml(cat) + '</a>';
    }).join('');
  }

  var slug = getSlug();
  if (!slug) {
    window.location.href = '/blog/';
    return;
  }

  var postUrl = '/blog/posts/' + slug + '.md';

  Promise.all([
    fetch(postUrl).then(function (r) {
      if (!r.ok) throw new Error('Post not found');
      return r.text();
    }),
    fetch('/blog/blogs.json').then(function (r) { return r.json(); })
  ])
    .then(function (results) {
      var mdText = results[0];
      var allPosts = results[1] || [];

      var parsed = parseFrontmatter(mdText);
      var meta = parsed.meta;
      var body = parsed.body;

      var title = meta.title || 'Blog';
      document.title = title + ' | Vanhie Vandaele';
      var desc = meta.excerpt || '';
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && desc) metaDesc.setAttribute('content', desc);

      var contentEl = document.getElementById('blog-post-content');
      if (contentEl && typeof marked !== 'undefined') {
        marked.setOptions({ gfm: true });
        contentEl.innerHTML = marked.parse(body);
      } else if (contentEl) {
        contentEl.innerHTML = '<p>' + escapeHtml(body) + '</p>';
      }

      document.getElementById('blog-breadcrumb-title').textContent = shortTitle(title);
      document.getElementById('blog-hero-title').textContent = title;
      document.getElementById('blog-hero-date').textContent = formatDate(meta.date);

      var categories = [];
      var seen = {};
      for (var i = 0; i < allPosts.length; i++) {
        var c = allPosts[i].category;
        if (c && !seen[c]) { seen[c] = true; categories.push(c); }
      }
      var catList = document.getElementById('blog-categories-list');
      if (catList) catList.innerHTML = renderCategories(categories);

      var related = allPosts.filter(function (p) { return p.slug !== slug; }).slice(0, 3);
      var relatedGrid = document.getElementById('blog-related-grid');
      if (relatedGrid) relatedGrid.innerHTML = related.map(renderRelatedCard).join('');
    })
    .catch(function () {
      window.location.href = '/blog/';
    });
})();
