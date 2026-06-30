(function() {
    'use strict';

    var app = document.getElementById('app');

    function init() {
        loadTheme();

        fetchJSON('data/site.json').then(function(siteData) {
            setFavicon(siteData);
            setMetaDescription(siteData);
            buildNav(siteData);
            buildFooter(siteData);
            var sections = siteData.sections || [];
            var sectionPromises = [];

            sections.forEach(function(sectionConfig) {
                if (sectionConfig.enabled === false) {
                    sectionPromises.push(null);
                    return;
                }
                var sectionPath = sectionConfig.file.indexOf('/') >= 0 ? sectionConfig.file : 'data/' + sectionConfig.file;
                sectionPromises.push(
                    fetchJSON(sectionPath).then(function(sectionData) {
                        var render = renderers[sectionData.type];
                        if (render) {
                            return render(sectionData);
                        }
                        return null;
                    }).catch(function(err) {
                        console.warn('Skipped section:', sectionConfig.file, err.message);
                        return null;
                    })
                );
            });

            return Promise.all(sectionPromises).then(function(htmls) {
                var fullHtml = htmls.filter(function(h) { return h !== null; }).join('<hr class="thick-divider"/>');
                app.innerHTML = fullHtml + '<hr class="thick-divider"/>';

                initScrollSpy();
                initMobileMenu();
                initCVButton(siteData);

                var contactPromise = null;
                sections.forEach(function(s) {
                    if (s.file === 'contact.json') {
                        contactPromise = fetchJSON('data/contact.json').then(function(c) {
                            initContactForm(c.emailjs || null);
                        });
                    }
                });

                var blogPromise = null;
                sections.forEach(function(s) {
                    if (s.file.indexOf('blog') !== -1 && s.enabled !== false) {
                        var blogPath = s.file.indexOf('/') >= 0 ? s.file : 'data/' + s.file;
                        blogPromise = fetchJSON(blogPath).then(function(blogData) {
                            if (blogData && blogData.data && blogData.data.manifest) {
                                var manifestPath = blogData.data.manifest;
                                return fetchJSON(manifestPath).then(function(manifest) {
                                    var preview = document.getElementById('blogPostPreview');
                                    if (preview) {
                                        initBlogPreview('blogPostPreview', manifest, blogData.data.preview_count || 3, blogData.data.read_more_url || 'pages/blog.html');
                                    }
                                });
                            }
                        }).catch(function(err) {
                            console.warn('Blog preview failed:', err.message);
                        });
                    }
                });

                return Promise.all([contactPromise, blogPromise].filter(Boolean));
            });
        }).catch(function(err) {
            app.innerHTML = '<p style="padding:4rem;text-align:center;color:var(--color-on-surface-variant);">Failed to load site data. Please try refreshing the page.</p>';
            console.error(err);
        });
    }

    function setFavicon(siteData) {
        if (siteData.favicon) {
            var links = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
            links.forEach(function(link) { link.href = siteData.favicon; });
            if (!links.length) {
                var link = document.createElement('link');
                link.rel = 'icon';
                link.href = siteData.favicon;
                document.head.appendChild(link);
            }
        }
    }

    function setMetaDescription(siteData) {
        if (siteData.description) {
            var meta = document.querySelector('meta[name="description"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'description';
                document.head.appendChild(meta);
            }
            meta.content = siteData.description;
        }
    }

    function buildNav(siteData) {
        var brandName = document.querySelector('.nav-logo');
        if (brandName) brandName.textContent = siteData.name || '';

        var navLinks = document.querySelector('.nav-links');
        var mobileNavLinks = document.querySelector('.mobile-nav-links');

        if (navLinks) {
            var frag = document.createDocumentFragment();
            var items = [];
            (siteData.sections || []).forEach(function(s) {
                if (s.nav && s.nav.show && s.enabled !== false) {
                    var a = document.createElement('a');
                    a.href = '#' + s.id;
                    a.textContent = s.nav.label || s.id;
                    frag.appendChild(a);
                    items.push(a);
                }
            });
            navLinks.appendChild(frag);
            if (mobileNavLinks) {
                mobileNavLinks.innerHTML = '';
                items.forEach(function(a) {
                    mobileNavLinks.appendChild(a.cloneNode(true));
                });
            }
        }
    }

    function buildFooter(siteData) {
        var footer = document.querySelector('footer');
        if (!footer) return;
        var f = siteData.footer;
        if (!f) return;
        var footerLogo = footer.querySelector('.footer__logo');
        var footerTagline = footer.querySelector('.footer__tagline');
        var footerLinks = footer.querySelector('.footer__nav');
        if (footerLogo) footerLogo.textContent = f.name || '';
        if (footerTagline) footerTagline.innerHTML = nl2br(escapeHTML(f.tagline || ''));
        if (footerLinks && f.links) {
            footerLinks.innerHTML = '';
            f.links.forEach(function(link) {
                var el;
                if (link.url) {
                    el = document.createElement('a');
                    el.href = link.url;
                } else {
                    el = document.createElement('span');
                }
                el.textContent = link.label || '';
                footerLinks.appendChild(el);
            });
        }
    }

    init();
})();
