var IMG_PREFIX = window.IMG_PREFIX || '';
var CONFIG = {
  manifest: IMG_PREFIX + 'blog/posts.json',
  homepage: IMG_PREFIX + 'blog/posts/home.json'
};

const app = document.getElementById('app');
let postsData = [];
let fnRefCounts = {};
let fnRefs = {};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatText(str) {
  if (!str) return '';
  const saved = {};
  let n = 0;

  str = str.replace(/\\(.)/g, (_, c) => {
    const k = '\x00' + n++;
    saved[k] = c;
    return k;
  });

  str = str.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  str = str.replace(/~~(.+?)~~/g, '<s>$1</s>');
  str = str.replace(/\+\+(.+?)\+\+/g, '<u>$1</u>');
  str = str.replace(/==(.+?)==/g, '<mark>$1</mark>');
  str = str.replace(/\|\|(.+?)\|\|/g, '<span class="spoiler">$1</span>');
  str = str.replace(/\^(.+?)\^/g, '<sup>$1</sup>');
  str = str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  str = str.replace(/__(.+?)__/g, '<strong>$1</strong>');
  str = str.replace(/\*(.+?)\*/g, '<em>$1</em>');
  str = str.replace(/_(.+?)_/g, '<em>$1</em>');
  str = str.replace(/~(.+?)~/g, '<sub>$1</sub>');
  str = str.replace(/`(.+?)`/g, '<code>$1</code>');

  str = str.replace(/\(fn:([\w.-]+)\)/g, (_, id) => {
    if (!fnRefCounts[id]) fnRefCounts[id] = 0;
    const idx = fnRefCounts[id]++;
    const refId = `fnref-${id}-${idx}`;
    if (!fnRefs[id]) fnRefs[id] = [];
    fnRefs[id].push(refId);
    return `<sup class="fn-ref" id="${refId}"><a href="#" class="fn-link" data-fn="${id}">${id}</a></sup>`;
  });
  str = str.replace(/\{([^}|]+)\|([^}]+)\}/g, (_, text, url) => {
    return `<a href="${url}">${text}</a>`;
  });

  const aTags = {};
  let aN = 0;
  str = str.replace(/<a\b[^>]*>.*?<\/a>/g, m => {
    const k = '\x01A' + aN++;
    aTags[k] = m;
    return k;
  });
  str = str.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  str = str.replace(/\x01A\d+/g, m => aTags[m] || '');

  str = str.replace(/\x00\d+/g, m => saved[m] || '');
  return str;
}

function html(str) {
  return formatText(escapeHTML(str));
}

function renderHome() {
  var header = document.querySelector('.blog-header');
  if (header) header.style.display = '';
  fnRefCounts = {}; fnRefs = {};
  fetch(CONFIG.homepage)
    .then(r => r.json())
    .then(data => {
      const ctx = { posts: postsData, view: 'home' };
      const blocks = (data.blocks || []).map(b => renderBlock(b, ctx)).join('');
      let footnotesHtml = '';
      if (data.footnotes && data.footnotes.length) {
        footnotesHtml = `
          <section class="footnotes">
            <h2 class="footnotes-title">Footnotes</h2>
            <ol>${data.footnotes.map(fn => {
              const refs = fnRefs[fn.id] || [];
              return `
              <li id="fn-${escapeHTML(fn.id)}">
                ${html(fn.text)}
                ${refs.map((refId, i) => 
                  `<a href="#" class="fn-back" data-fnref="${refId}" aria-label="Back to reference">&#8617;<sup>${i + 1}</sup></a>`
                ).join(' ')}
              </li>`;
            }).join('')}</ol>
          </section>`;
      }
      app.innerHTML = blocks + footnotesHtml;
      history.replaceState({ view: 'list' }, '', window.location.pathname);
    })
    .catch(() => renderPostList(postsData));
}

function showList() {
  renderHome();
  history.pushState({ view: 'list' }, '', window.location.pathname);
}

function showPost(id, replace) {
  const post = postsData.find(p => p.id === id);
  if (!post) { showList(); return; }
  fetch(IMG_PREFIX + post.file)
    .then(r => { if (!r.ok) throw new Error('Failed to load post'); return r.json(); })
    .then(data => {
      renderPostDetail(data, post.hide);
      if (replace) {
        history.replaceState({ view: 'post', id }, '', `?post=${id}`);
      } else {
        history.pushState({ view: 'post', id }, '', `?post=${id}`);
      }
    })
    .catch(() => { app.innerHTML = '<div class="error">Failed to load post.</div>'; });
}

function renderPostList(posts) {
  var header = document.querySelector('.blog-header');
  if (header) header.style.display = '';
  if (!posts.length) {
    app.innerHTML = '<div class="error">No posts found.</div>';
    return;
  }
  app.innerHTML = `<div class="blog-listing"><div class="blog-grid">${posts.filter(function(p) { return !p.hide; }).map(p => `
    <a href="?post=${encodeURIComponent(p.id)}" class="blog-card">
      <div class="blog-card-meta"><span class="blog-date">${escapeHTML(p.date || '')}</span></div>
      <h3 class="blog-title">${escapeHTML(p.title)}</h3>
      ${p.image ? `<img class="blog-card-img" src="${escapeHTML(IMG_PREFIX + p.image)}" alt="${escapeHTML(p.title)}">` : ''}
      ${p.excerpt ? `<p class="blog-excerpt">${escapeHTML(p.excerpt)}</p>` : ''}
      <div class="blog-card-footer"><span class="btn btn--secondary" aria-label="Read more about ${escapeHTML(p.title)}">Read More</span></div>
    </a>
  `).join('')}</div></div>`;
}

function renderPostDetail(post, isHidden) {
  var header = document.querySelector('.blog-header');
  if (header) header.style.display = 'none';
  fnRefCounts = {}; fnRefs = {};
  const ctx = { posts: postsData, view: 'post' };
  const blocks = (post.blocks || []).map(b => renderBlock(b, ctx)).join('');

  let footnotesHtml = '';
  if (post.footnotes && post.footnotes.length) {
    footnotesHtml = `
      <section class="footnotes">
        <h2 class="footnotes-title">Footnotes</h2>
        <ol>${post.footnotes.map(fn => {
          const refs = fnRefs[fn.id] || [];
          return `
          <li id="fn-${escapeHTML(fn.id)}">
            ${html(fn.text)}
            ${refs.map((refId, i) => 
              `<a href="#" class="fn-back" data-fnref="${refId}" aria-label="Back to reference">&#8617;<sup>${i + 1}</sup></a>`
            ).join(' ')}
          </li>`;
        }).join('')}</ol>
      </section>`;
  }

  let heroHtml = '';
  if (post.hero) {
    const hero = typeof post.hero === 'string' ? { src: post.hero } : post.hero;
    const alt = escapeHTML(hero.alt || post.title || '');
    const align = hero.align || 'center';
    const tagSize = hero.taglineSize || 'xl';
    const tagline = hero.tagline ? `<p class="hero-tagline size-${tagSize}">${html(hero.tagline)}</p>` : '';
    const caption = hero.caption ? `<figcaption>${escapeHTML(hero.caption)}</figcaption>` : '';
    const credit = hero.credit ? `<span class="img-credit">${escapeHTML(hero.credit)}</span>` : '';
    heroHtml = `<figure class="hero-figure align-${align}">${credit}<img src="${escapeHTML(IMG_PREFIX + (hero.src || ''))}" alt="${alt}" class="hero-img">${tagline}${caption}</figure>`;
  }

  app.innerHTML = `
    <div class="post-detail" style="display:block">
      ${isHidden ? '' : '<button class="back-btn" id="backBtn">&larr; Back to all posts</button>'}
      ${heroHtml}
      <h1 class="post-title">${escapeHTML(post.title)}</h1>
      <div class="post-meta">${formatDate(post.date)}</div>
      ${blocks}
      ${footnotesHtml}
    </div>
  `;
  var backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.addEventListener('click', showList);
}

function renderBlock(block, context) {
  switch (block.type) {
    case 'blog-posts': {
      if (context && context.view === 'post') return '';
      const posts = (context && context.posts) || postsData;
      if (!posts.length) return '';
      return `<div class="block block-blog-posts"><div class="post-list">${posts.filter(function(p) { return !p.hide; }).map(p => `
        <article class="post-card" data-id="${escapeHTML(p.id)}">
          <h2>${escapeHTML(p.title)}</h2>
          <div class="post-date">${formatDate(p.date)}</div>
        </article>
      `).join('')}</div></div>`;
    }
    case 'featured-post': {
      if (context && context.view === 'post') return '';
      const post = (context && context.posts || postsData).find(p => p.id === block.post);
      if (!post) return '';
      const excerpt = block.excerpt || '';
      return `<article class="block featured-card" data-id="${escapeHTML(post.id)}">
        <div class="featured-badge">Featured</div>
        <h2>${escapeHTML(post.title)}</h2>
        <div class="post-date">${formatDate(post.date)}</div>
        ${excerpt ? `<div class="featured-excerpt">${html(excerpt)}</div>` : ''}
        <span class="read-more" aria-label="Read more about ${escapeHTML(post.title)}">Read more &rarr;</span>
      </article>`;
    }
    case 'image': {
      const layout = block.layout || 'center';
      const size = block.size || 'large';
      const alt = escapeHTML(block.alt || '');
      const caption = block.caption ? `<figcaption>${escapeHTML(block.caption)}</figcaption>` : '';
      const credit = block.credit ? `<span class="img-credit">${escapeHTML(block.credit)}</span>` : '';
      const borderCls = block.border ? ' img-border' : '';
      const ratioStyle = block.aspectRatio ? ` style="aspect-ratio:${escapeHTML(block.aspectRatio)}"` : '';
      const lightboxAttr = block.lightbox ? ' data-lightbox="true"' : '';

      let img = `<img src="${escapeHTML(IMG_PREFIX + (block.src || ''))}" alt="${alt}" loading="lazy"${ratioStyle}>`;
      if (block.link) {
        const target = block.target === '_blank' ? ' target="_blank" rel="noopener"' : '';
        img = `<a href="${escapeHTML(block.link)}"${target}>${img}</a>`;
      }

      const figure = `<figure class="img-figure${borderCls}"${lightboxAttr}>${img}${credit}${caption}</figure>`;

      if (layout === 'left' || layout === 'right') {
        const text = block.text ? `<div class="img-text">${html(block.text)}</div>` : '';
        return `<div class="block block-image layout-${layout} size-${size}">${layout === 'left' ? figure + text : text + figure}</div>`;
      }
      return `<div class="block block-image layout-${layout} size-${size}">${figure}</div>`;
    }
    case 'heading': {
      const level = Math.min(Math.max(block.level || 2, 1), 6);
      return `<div class="block block-heading"><h${level}>${html(block.text)}</h${level}></div>`;
    }
    case 'blockquote': {
      let attribution = '';
      if (block.attribution) {
        const cite = `<cite>${html(block.attribution)}</cite>`;
        const linked = block.citeUrl ? `<a href="${escapeHTML(block.citeUrl)}">${cite}</a>` : cite;
        attribution = `<p class="quote-attribution">&mdash; ${linked}</p>`;
      }
      return `<div class="block block-blockquote">${html(block.text)}${attribution}</div>`;
    }
    case 'pullquote':
    case 'epigraph': {
      const layout = block.type === 'pullquote' ? (block.layout || 'center') : (block.layout || 'right');
      let attribution = '';
      if (block.attribution) {
        const cite = `<cite>${html(block.attribution)}</cite>`;
        const linked = block.citeUrl ? `<a href="${escapeHTML(block.citeUrl)}">${cite}</a>` : cite;
        attribution = `<p class="quote-attribution">&mdash; ${linked}</p>`;
      }
      return `<div class="block block-${block.type} layout-${layout}">${html(block.text)}${attribution}</div>`;
    }
    case 'math': {
      const formula = block.formula || '';
      const displayMode = block.displayMode !== false;
      const align = displayMode ? (block.align || 'center') : '';
      const label = block.label ? `<span class="math-label">(${escapeHTML(block.label)})</span>` : '';
      const caption = block.caption ? `<figcaption class="math-caption">${html(block.caption)}</figcaption>` : '';
      let rendered;
      try {
        if (typeof katex !== 'undefined') {
          rendered = katex.renderToString(formula, { displayMode, throwOnError: false });
        } else {
          rendered = `<code class="math-fallback">${escapeHTML(formula)}</code>`;
        }
      } catch (e) {
        rendered = `<code class="math-fallback">${escapeHTML(formula)}</code>`;
      }
      if (!displayMode) {
        return `<span class="block-math math-inline">${rendered}</span>`;
      }
      const alignCls = align === 'left' ? ' math-left' : '';
      return `<div class="block block-math math-display${alignCls}">${rendered}${label}</div>${caption ? `<div class="block block-math-caption">${caption}</div>` : ''}`;
    }
    case 'table': {
      const headers = block.headers || [];
      const aligns = block.alignments || [];
      const striped = block.striped ? ' table-striped' : '';
      const capPos = block.captionPosition === 'top' ? ' cap-top' : '';
      const caption = block.caption ? `<caption>${html(block.caption)}</caption>` : '';
      const rows = block.rows || [];

      const thead = headers.length ? `<thead><tr>${headers.map((h, i) => {
        const align = aligns[i] ? ` style="text-align:${aligns[i]}"` : '';
        return `<th${align}>${escapeHTML(h)}</th>`;
      }).join('')}</tr></thead>` : '';

      const tbody = `<tbody>${rows.map(row => {
        if (!Array.isArray(row)) return '';
        return `<tr>${row.map((cell, i) => {
          const align = aligns[i] ? ` style="text-align:${aligns[i]}"` : '';
          return `<td${align}>${html(String(cell))}</td>`;
        }).join('')}</tr>`;
      }).join('')}</tbody>`;

      return `<div class="block block-table${striped}${capPos}"><table>${caption}${thead}${tbody}</table></div>`;
    }
    case 'code': {
      const lang = block.language ? `<span class="code-lang">${escapeHTML(block.language)}</span>` : '';
      const filename = block.filename ? `<span class="code-filename">${escapeHTML(block.filename)}</span>` : '';
      const showCopy = block.enableCopy !== false;
      const copyBtn = showCopy ? `<button class="code-copy" data-copy="${escapeHTML(block.code)}">Copy</button>` : '';
      const header = (lang || filename || copyBtn) ? `<div class="code-header">${lang}${filename}${copyBtn}</div>` : '';
      const highlightSet = new Set(block.highlightLines || []);

      const lines = block.code.split('\n');
      const numbered = block.showLineNumbers;
      const maxLen = numbered ? String(lines.length).length : 0;

      const html = lines.map((line, i) => {
        const lineNum = numbered ? `<span class="cl-num">${String(i + 1).padStart(maxLen, ' ')}</span>` : '';
        const hl = highlightSet.has(i + 1) ? ' cl-hl' : '';
        return `<span class="cl-line${hl}">${lineNum}<span class="cl-text">${escapeHTML(line)}</span></span>`;
      }).join('');

      return `<div class="block block-code">${header}<pre class="code-pre"><code>${html}</code></pre></div>`;
    }
    case 'list': {
      const style = block.style === 'number' ? 'ol' : 'ul';
      const rawItems = block.items || [];

      const parseItem = (item) => {
        if (typeof item === 'object' && item.text != null) {
          return { level: 0, text: String(item.text), sublist: item.sublist || null };
        }
        const str = String(item);
        const sp = str.match(/^(\s*)(.*)/);
        return { level: Math.floor(sp[1].length / 2), text: sp[2], sublist: null };
      };

      const renderList = (items, startIdx, tag) => {
        let i = startIdx;
        const baseLevel = items[startIdx] ? items[startIdx].level : 0;
        const lis = [];

        while (i < items.length) {
          const item = items[i];
          if (item.level < baseLevel) break;

          if (item.level === baseLevel) {
            let text = item.text;

            // task checkbox
            let checked = '';
            if (/^\[x\]\s*/i.test(text)) { checked = ' checked'; text = text.replace(/^\[x\]\s*/i, ''); }
            else if (/^\[\s*\]\s*/.test(text)) { checked = ''; text = text.replace(/^\[\s*\]\s*/i, ''); }
            const cb = checked !== '' ? `<input type="checkbox"${checked}>` : '';

            let inner = '';
            // check for object sublist
            if (item.sublist) {
              const subTag = item.sublist.style === 'number' ? 'ol' : 'ul';
              const subItems = (item.sublist.items || []).map(parseItem);
              inner = html(text) + renderList(subItems, 0, subTag);
            } else {
              // look ahead for nested items
              let nested = '';
              if (i + 1 < items.length && items[i + 1].level > baseLevel) {
                const result = renderList(items, i + 1, tag);
                nested = result.html;
                i += result.consumed;
              }
              inner = cb + html(text) + nested;
            }
            lis.push(`<li>${inner}</li>`);
            i++;
          } else {
            i++;
          }
        }
        return { html: `<${tag} class="ll">${lis.join('')}</${tag}>`, consumed: i - startIdx };
      };

      const parsed = rawItems.map(parseItem);
      const result = parsed.length ? renderList(parsed, 0, style) : '';
      return `<div class="block block-list">${result.html || ''}</div>`;
    }
    case 'link':
      return `<div class="block block-link"><a href="${escapeHTML(block.url)}" target="_blank" rel="noopener" class="cta-link">${html(block.text)}</a></div>`;
    case 'button': {
      const align = block.align || 'left';
      const variant = block.variant === 'outline' ? ' btn-outline' : ' btn-primary';
      const text = block.text ? html(block.text) : '';
      return `<div class="block block-button align-${align}"><a href="${escapeHTML(block.url || '#')}" target="_blank" rel="noopener" class="btn${variant}">${text}</a></div>`;
    }
    case 'embed': {
      const embedCap = block.caption ? `<figcaption style="text-align:center;font-size:.85rem;color:var(--color-text-secondary);margin-top:.4rem">${escapeHTML(block.caption)}</figcaption>` : '';
      return `<div class="block block-embed" style="position:relative;width:100%;aspect-ratio:${block.ratio || '16/9'};margin:1.5rem 0"><iframe src="${escapeHTML(block.src)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen></iframe>${embedCap}</div>`;
    }
    case 'video': {
      const url = block.url || '';
      const caption = block.caption ? `<figcaption>${escapeHTML(block.caption)}</figcaption>` : '';
      const poster = block.poster ? ` poster="${escapeHTML(block.poster)}"` : '';
      let embed = '';

      // YouTube
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
      if (ytMatch) {
        embed = `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }

      // Vimeo
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        embed = `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      }

      // Direct video file
      if (!embed) {
        embed = `<video controls${poster}><source src="${escapeHTML(url)}" type="video/${url.endsWith('.webm') ? 'webm' : url.endsWith('.ogg') ? 'ogg' : 'mp4'}">Your browser does not support the video tag.</video>`;
      }

      return `<div class="block block-video"><figure class="video-figure">${embed}${caption}</figure></div>`;
    }
    case 'gallery': {
      const images = block.images || [];
      const layout = block.layout || 'grid';
      const cols = block.columns || 3;
      const ratio = block.ratio || 'original';

      const imgHtml = (img) => {
        const alt = escapeHTML(img.alt || '');
        const credit = img.credit ? `<span class="img-credit">${escapeHTML(img.credit)}</span>` : '';
        const caption = img.caption ? `<figcaption>${html(img.caption)}</figcaption>` : '';
        return `<figure class="gallery-figure">${credit}<img src="${escapeHTML(IMG_PREFIX + (img.src || ''))}" alt="${alt}" loading="lazy">${caption}</figure>`;
      };

      if (layout === 'masonry') {
        const items = images.slice(0, 2).map((img, i) => {
          const cls = i === 0 ? ' masonry-hero' : ' masonry-side';
          return `<div class="gallery-cell${cls}">${imgHtml(img)}</div>`;
        }).join('');
        return `<div class="block block-gallery layout-masonry ratio-${ratio}"><div class="gallery-masonry">${items}</div></div>`;
      }

      if (layout === 'carousel') {
        const items = images.map(img => `<div class="gallery-cell">${imgHtml(img)}</div>`).join('');
        return `<div class="block block-gallery layout-carousel"><div class="gallery-track">${items}</div></div>`;
      }

      // grid (default)
      const gridItems = images.map(img => `<div class="gallery-cell">${imgHtml(img)}</div>`).join('');
      return `<div class="block block-gallery layout-grid cols-${cols} ratio-${ratio}"><div class="gallery-grid">${gridItems}</div></div>`;
    }
    case 'audio': {
      const title = block.title ? `<div class="audio-title">${escapeHTML(block.title)}</div>` : '';
      const caption = block.caption ? `<figcaption>${escapeHTML(block.caption)}</figcaption>` : '';
      return `<div class="block block-audio"><figure>${title}<audio controls src="${escapeHTML(block.src)}"></audio>${caption}</figure></div>`;
    }
    case 'divider': {
      const style = block.style || 'solid';
      return `<hr class="block block-divider divider-${style}">`;
    }
    case 'spacer': {
      const h = Math.max(parseInt(block.height, 10) || 40, 1);
      return `<div class="block block-spacer" style="height:${h}px"></div>`;
    }
    case 'text':
      return `<div class="block block-text"><p>${html(block.text)}</p></div>`;
    case 'paragraph':
      return `<div class="block block-paragraph"><p>${html(block.content)}</p></div>`;
    case 'columns': {
      const count = Math.min(Math.max(block.count || 2, 2), 3);
      const cols = block.columns || [];
      const colHtml = cols.map(col => {
        const inner = (col.blocks || []).map(b => renderBlock(b, context)).join('');
        return `<div class="col">${inner}</div>`;
      }).join('');
      return `<div class="block block-columns cols-${count}">${colHtml}</div>`;
    }
    case 'callout': {
      const icons = { info: '\u2139\uFE0F', tip: '\uD83D\uDCA1', warning: '\u26A0\uFE0F', error: '\u274C' };
      const style = block.style || 'info';
      const icon = icons[style] || icons.info;
      return `<div class="block block-callout callout-${style}"><span class="callout-icon">${icon}</span><div class="callout-body">${html(block.text)}</div></div>`;
    }
    case 'accordion': {
      const open = block.open ? ' open' : '';
      return `<details class="block block-accordion"${open}><summary>${escapeHTML(block.summary)}</summary><div class="accordion-content">${html(block.text)}</div></details>`;
    }
    default:
      return '';
  }
}

fetch(CONFIG.manifest)
  .then(r => { if (!r.ok) throw new Error('Failed to load manifest'); return r.json(); })
  .then(data => {
    postsData = data.posts || [];
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');
    if (postId) {
      showPost(postId, true);
    } else {
      renderHome();
    }
  })
  .catch(err => {
    app.innerHTML = `<div class="error">Error: ${escapeHTML(err.message)}</div>`;
  });

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.view === 'post') {
    showPost(e.state.id, true);
  } else {
    renderHome();
  }
});

var siteTitle = document.getElementById('siteTitle');
if (siteTitle) siteTitle.addEventListener('click', showList);

app.addEventListener('click', (e) => {
  const card = e.target.closest('.post-card');
  if (card) { e.preventDefault(); showPost(card.dataset.id); return; }

  const fnLink = e.target.closest('.fn-link');
  if (fnLink) {
    e.preventDefault();
    const id = fnLink.dataset.fn;
    const fnEl = document.getElementById('fn-' + id);
    if (!fnEl) return;
    document.querySelectorAll('.fn-active').forEach(x => x.classList.remove('fn-active'));
    fnEl.classList.add('fn-active');
    fnEl.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const fnBack = e.target.closest('.fn-back');
  if (fnBack) {
    e.preventDefault();
    const id = fnBack.dataset.fnref;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const lightboxFig = e.target.closest('[data-lightbox="true"]');
  if (lightboxFig) {
    e.preventDefault();
    const img = lightboxFig.querySelector('img');
    if (!img) return;
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `<div class="lightbox-bg"></div><img src="${escapeHTML(IMG_PREFIX + (img.src || ''))}" alt="${escapeHTML(img.alt)}" class="lightbox-img"><button class="lightbox-close">&times;</button>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    overlay.addEventListener('click', (ev) => {
      if (ev.target.closest('.lightbox-close') || ev.target.classList.contains('lightbox-bg')) {
        overlay.remove();
        document.body.style.overflow = '';
      }
    });
    return;
  }

  const copyBtn = e.target.closest('.code-copy');
  if (copyBtn) {
    e.preventDefault();
    const code = copyBtn.dataset.copy;
    navigator.clipboard.writeText(code).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    });
    return;
  }
});
