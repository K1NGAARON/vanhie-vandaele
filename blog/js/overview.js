(function () {
  const BLOG_GRID_ID = 'blog-grid';
  const BLOGS_JSON = 'blogs.json';

  const MONTHS_NL = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ];

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = MONTHS_NL[d.getMonth()];
    const year = d.getFullYear();
    return day + ' ' + month + ' ' + year;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderCard(post) {
    const postUrl = 'post.html?slug=' + encodeURIComponent(post.slug);
    const dateFormatted = formatDate(post.date);
    return (
      '<article class="blog-card">' +
        '<div class="blog-card-image-wrap">' +
          '<a href="' + postUrl + '">' +
            '<img src="' + escapeHtml(post.image || '') + '" alt="" loading="lazy">' +
          '</a>' +
          '<span class="blog-card-category">' + escapeHtml(post.category) + '</span>' +
        '</div>' +
        '<div class="blog-card-body">' +
          '<time class="blog-card-date">' + escapeHtml(dateFormatted) + '</time>' +
          '<h2 class="blog-card-title">' +
            '<a href="' + postUrl + '">' + escapeHtml(post.title) + '</a>' +
          '</h2>' +
          '<p class="blog-card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
          '<a href="' + postUrl + '" class="blog-card-link">Lees verder →</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderGrid(posts) {
    const grid = document.getElementById(BLOG_GRID_ID);
    if (!grid) return;
    grid.innerHTML = posts.map(renderCard).join('');
  }

  fetch(BLOGS_JSON)
    .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('Failed to load blog list')); })
    .then(function (posts) {
      renderGrid(Array.isArray(posts) ? posts : []);
    })
    .catch(function () {
      var grid = document.getElementById(BLOG_GRID_ID);
      if (grid) grid.innerHTML = '<p>Geen artikelen gevonden.</p>';
    });
})();
