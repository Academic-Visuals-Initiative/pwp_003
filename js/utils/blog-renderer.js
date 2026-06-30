function generateBlogCards(manifest, count, readMoreUrl) {
    if (!manifest || !manifest.posts || !manifest.posts.length) {
        return '<div class="blog-empty">No posts yet. Come back soon!</div>';
    }
    var posts = manifest.posts.filter(function(p) { return !p.hide; }).filter(function(p) { return p.featured; }).slice(0, count);
    if (!posts.length) {
        return '<div class="blog-empty">No featured posts yet. Come back soon!</div>';
    }
    var html = '<div class="blog-grid">';
    posts.forEach(function(post) {
        var postUrl = 'pages/blog.html?post=' + encodeURIComponent(post.id);
        html += '<div class="blog-card">' +
            '<div class="blog-card-meta">' +
                '<span class="blog-date">' + escapeHTML(post.date || '') + '</span>' +
            '</div>' +
            '<h3 class="blog-title">' + escapeHTML(post.title) + '</h3>' +
            (post.image ? '<img class="blog-card-img" src="' + post.image + '" alt="' + escapeHTML(post.title) + '" width="1024" height="686" loading="lazy">' : '') +
            (post.excerpt ? '<p class="blog-excerpt">' + escapeHTML(post.excerpt) + '</p>' : '') +
            '<div class="blog-card-footer">' +
                '<a class="btn btn--secondary" href="' + postUrl + '" aria-label="Read more about ' + escapeHTML(post.title) + '">Read More</a>' +
            '</div>' +
        '</div>';
    });
    html += '</div>';
    return html;
}

function initBlogPreview(containerId, manifest, count, readMoreUrl) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = generateBlogCards(manifest, count, readMoreUrl);
}
